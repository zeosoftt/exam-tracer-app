/**
 * Dashboard Stats API
 * GET /api/dashboard/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { prisma } from '@/lib/db/prisma';
import { logApi } from '@/lib/logger';
import { HTTP_STATUS } from '@/config/constants';
import { UnauthorizedError } from '@/lib/errors/AppError';
import { evaluateTopics, getEvaluationSummary } from '@/lib/services/targetScoreEvaluation';
import { getRequiredNet } from '@/config/targetScoreMaps';

async function getStatsHandler(_req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    const institutionId = session.user.institutionId;

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        targetScore: true,
        dailyStudyHours: true,
      },
    });

    // Get exams count
    const examWhere: {
      deletedAt: null;
      examAssignments?: {
        some: {
          OR: Array<{ userId?: string; institutionId?: string | null }>;
          deletedAt: null;
        };
      };
    } = { deletedAt: null };
    if (userRole !== 'ADMIN') {
      examWhere.examAssignments = {
        some: {
          OR: [
            { userId },
            { institutionId },
          ],
          deletedAt: null,
        },
      };
    }

    const totalExams = await prisma.exam.count({ where: examWhere });

    const activeExams = await prisma.exam.count({
      where: {
        ...examWhere,
        status: 'ACTIVE',
      },
    });

    // Get active exam assigned to user
    const activeExamAssignment = await prisma.examAssignment.findFirst({
      where: {
        userId,
        deletedAt: null,
        exam: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      },
      include: {
        exam: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    // Get total topics and subjects count for active exam
    // Count all topics under all sections of the active exam
    // Hierarchy: Exam -> Section -> Subject -> Topic
    // For KPSS: Exam (KPSS) -> Sections (Genel Yetenek, Genel Kültür) -> Subjects -> Topics
    let totalTopics = 0;
    let totalSubjects = 0;
    let completedTopics = 0;
    let inProgressTopics = 0;
    let notStartedTopics = 0;
    let reviewedTopics = 0;

    if (activeExamAssignment?.exam?.id) {
      const examId = activeExamAssignment.exam.id;
      
      // OPTIMIZED: Run counts and topic fetch in parallel to reduce total query time
      const [topicsCount, subjectsCount, , progressStats] = await Promise.all([
        // Count all topics across all sections of this exam
        prisma.topic.count({
          where: {
            subject: {
              section: {
                examId: examId,
                deletedAt: null,
              },
              deletedAt: null,
            },
            deletedAt: null,
          },
        }),
        // Count all subjects across all sections of this exam
        prisma.subject.count({
          where: {
            section: {
              examId: examId,
              deletedAt: null,
            },
            deletedAt: null,
          },
        }),
        // Get all topic IDs for this exam (lightweight query, only IDs)
        prisma.topic.findMany({
          where: {
            subject: {
              section: {
                examId: examId,
                deletedAt: null,
              },
              deletedAt: null,
            },
            deletedAt: null,
          },
          select: {
            id: true,
          },
        }),
        // Get progress stats (we'll filter by topicIds in a separate query if needed)
        // First, get all progress for this user in this exam
        prisma.userProgress.groupBy({
          by: ['status'],
          where: {
            userId,
            topic: {
              subject: {
                section: {
                  examId: examId,
                  deletedAt: null,
                },
                deletedAt: null,
              },
              deletedAt: null,
            },
            deletedAt: null,
          },
          _count: true,
        }),
      ]);

      totalTopics = topicsCount;
      totalSubjects = subjectsCount;

      completedTopics = progressStats.find((s) => s.status === 'COMPLETED')?._count || 0;
      inProgressTopics = progressStats.find((s) => s.status === 'IN_PROGRESS')?._count || 0;
      reviewedTopics = progressStats.find((s) => s.status === 'REVIEWED')?._count || 0;
      // Not started = total topics - (completed + in progress + reviewed)
      // A topic without a progress record is also considered "not started"
      notStartedTopics = totalTopics - (completedTopics + inProgressTopics + reviewedTopics);
    }

    // Get total study hours from completed pomodoro sessions (only work sessions, not breaks)
    const studyHoursStats = await prisma.pomodoroSession.aggregate({
      where: {
        userId,
        deletedAt: null,
        completed: true,
        isBreak: false,
      },
      _sum: {
        duration: true,
      },
      _count: true,
    });

    const totalStudyHours = studyHoursStats._sum.duration 
      ? Math.round((studyHoursStats._sum.duration / 60) * 10) / 10 // Convert minutes to hours, round to 1 decimal
      : 0;
    
    const totalPomodoroSessions = studyHoursStats._count || 0;

    // Haftalık çalışma: son 7 gün, günlük hedefe ulaşma
    const dailyGoalMinutes = (user?.dailyStudyHours ?? 0) * 60;
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const now = new Date();
    const weeklyStudySummary: Array<{
      date: string;
      dayName: string;
      minutesStudied: number;
      goalMinutes: number;
      completed: boolean;
      hoursStudied: number;
    }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setUTCHours(0, 0, 0, 0);
      const dateStr = d.toISOString().slice(0, 10);
      weeklyStudySummary.push({
        date: dateStr,
        dayName: dayNames[d.getDay()],
        minutesStudied: 0,
        goalMinutes: dailyGoalMinutes,
        completed: false,
        hoursStudied: 0,
      });
    }
    if (dailyGoalMinutes > 0) {
      const firstDay = new Date(weeklyStudySummary[0].date + 'T00:00:00.000Z');
      const lastDayEnd = new Date(weeklyStudySummary[6].date + 'T23:59:59.999Z');
      const sessions = await prisma.pomodoroSession.findMany({
        where: {
          userId,
          deletedAt: null,
          completed: true,
          isBreak: false,
          startedAt: {
            gte: firstDay,
            lte: lastDayEnd,
          },
        },
        select: { startedAt: true, duration: true },
      });
      for (const s of sessions) {
        const dateStr = new Date(s.startedAt).toISOString().slice(0, 10);
        const row = weeklyStudySummary.find((r) => r.date === dateStr);
        if (row) {
          row.minutesStudied += s.duration;
          row.hoursStudied = Math.round((row.minutesStudied / 60) * 10) / 10;
          row.completed = row.minutesStudied >= dailyGoalMinutes;
        }
      }
    }

    // Calculate evaluation summary if targetScore is set and there's an active exam
    let evaluationSummary = null;
    if (user?.targetScore && user.targetScore > 0 && activeExamAssignment?.exam?.id) {
      const examId = activeExamAssignment.exam.id;
      const examCode = activeExamAssignment.exam.code;
      const targetScore = user.targetScore;
      const totalExamQuestions = 120; // Default for KPSS, can be made configurable

      // OPTIMIZED: Use JOIN to fetch topics and progress in a single query
      // This reduces 2 queries to 1 query
      const topicsWithProgress = await prisma.topic.findMany({
        where: {
          subject: {
            section: {
              examId: examId,
              deletedAt: null,
            },
            deletedAt: null,
          },
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          order: true,
          subject: {
            select: {
              name: true,
              order: true,
              section: {
                select: {
                  name: true,
                  order: true,
                },
              },
            },
          },
          userProgress: {
            where: {
              userId,
              deletedAt: null,
            },
            select: {
              totalQuestions: true,
              correctAnswers: true,
              wrongAnswers: true,
            },
            take: 1, // Should only be one per user+topic
          },
        },
        orderBy: [
          {
            subject: {
              section: {
                order: 'asc',
              },
            },
          },
          {
            subject: {
              order: 'asc',
            },
          },
          {
            order: 'asc',
          },
        ],
      });

      // OPTIMIZED: Already have progress in the query result
      const topicsWithQuestions = topicsWithProgress.map((topic) => {
        const progress = topic.userProgress[0] || {
          totalQuestions: null,
          correctAnswers: null,
          wrongAnswers: null,
        };
        return {
          topicId: topic.id,
          topicName: topic.name,
          sectionName: topic.subject.section.name,
          subjectName: topic.subject.name,
          totalQuestions: progress.totalQuestions ?? 0,
          correctAnswers: progress.correctAnswers ?? 0,
          wrongAnswers: progress.wrongAnswers ?? 0,
        };
      });

      if (topicsWithQuestions.length > 0) {
        // Filter topics with questions for evaluation
        const topicsDataForEvaluation = topicsWithQuestions
          .filter((t) => t.totalQuestions > 0)
          .map((progress) => ({
            topicId: progress.topicId,
            topicName: progress.topicName,
            totalQuestions: progress.totalQuestions,
            correctAnswers: progress.correctAnswers,
            wrongAnswers: progress.wrongAnswers,
          }));

        const evaluations = evaluateTopics(topicsDataForEvaluation, {
          targetScore,
          totalExamQuestions,
          examCode,
        });

        const summary = getEvaluationSummary(evaluations);
        const requiredNet = getRequiredNet(targetScore, examCode);
        const requiredSuccessRate = requiredNet / totalExamQuestions;

        const evaluationByTopicId = new Map(evaluations.map((e) => [e.topicId, e]));
        const topicsWithStatus = topicsWithQuestions.map((t) => {
          const evalResult = evaluationByTopicId.get(t.topicId);
          return {
            ...t,
            status: evalResult?.status ?? null,
            topicSuccessRate: evalResult?.topicSuccessRate ?? null,
            topicNet: evalResult?.topicNet ?? null,
          };
        });

        evaluationSummary = {
          totalTopics: summary.totalTopics,
          goodTopics: summary.goodTopics,
          improvableTopics: summary.improvableTopics,
          repeatTopics: summary.repeatTopics,
          averageSuccessRate: summary.averageSuccessRate,
          averageNet: summary.averageNet,
          targetScore,
          requiredNet,
          requiredSuccessRate,
          topics: topicsWithStatus,
        };
      }
    }

    const stats = {
      totalExams,
      activeExams,
      completedTopics,
      inProgressTopics,
      notStartedTopics,
      reviewedTopics,
      totalTopics,
      totalSubjects,
      totalStudyHours,
      totalPomodoroSessions,
      activeExam: activeExamAssignment?.exam || null,
      user: {
        targetScore: user?.targetScore || null,
        dailyStudyHours: user?.dailyStudyHours || null,
      },
      evaluation: evaluationSummary,
      study: {
        dailyStudyHoursGoal: user?.dailyStudyHours ?? 0,
        weeklySummary: weeklyStudySummary,
      },
    };

    logApi('GET', '/api/dashboard/stats', HTTP_STATUS.OK, undefined, { userId });

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return handleError(error);
  }
}

export const GET = asyncHandler(getStatsHandler);
