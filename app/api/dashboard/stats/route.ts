/**
 * Dashboard Stats API
 * GET /api/dashboard/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { prisma } from '@/lib/db/prisma';

// Prisma client'ta ExamAttempt modeli schema'da var; generate sonrası examAttempt gelir. Tip için:
type PrismaWithExamAttempt = typeof prisma & {
  examAttempt: {
    count: (args: { where: { userId: string; deletedAt: null } }) => Promise<number>;
    findFirst: (args: {
      where: { userId: string; deletedAt: null };
      orderBy: { attemptedAt: 'desc' };
      select: { attemptedAt: true; totalScore: true; netScore: true; exam: { select: { name: true; code: true } } };
    }) => Promise<{
      attemptedAt: Date;
      totalScore: unknown;
      netScore: unknown;
      exam: { name: string; code: string };
    } | null>;
    findMany: (args: {
      where: { userId: string; deletedAt: null };
      orderBy: { attemptedAt: 'desc' };
      take: number;
      select: { attemptedAt: true; totalScore: true; netScore: true };
    }) => Promise<Array<{ attemptedAt: Date; totalScore: unknown; netScore: unknown }>>;
  };
};
const db = prisma as PrismaWithExamAttempt;
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

    // 1) Kullanıcı (hedef ve günlük saat için gerekli)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        targetScore: true,
        dailyStudyHours: true,
      },
    });

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
          OR: [{ userId }, { institutionId }],
          deletedAt: null,
        },
      };
    }

    // 2) Bağımsız tüm sorguları tek seferde paralel çalıştır
    const [
      totalExams,
      activeExams,
      activeExamAssignment,
      studyHoursStats,
      denemeCount,
      lastDeneme,
      recentAttemptsRaw,
    ] = await Promise.all([
      prisma.exam.count({ where: examWhere }),
      prisma.exam.count({ where: { ...examWhere, status: 'ACTIVE' } }),
      prisma.examAssignment.findFirst({
        where: {
          userId,
          deletedAt: null,
          exam: { status: 'ACTIVE', deletedAt: null },
        },
        include: { exam: { select: { id: true, name: true, code: true, startDate: true } } },
        orderBy: { assignedAt: 'desc' },
      }),
      prisma.pomodoroSession.aggregate({
        where: {
          userId,
          deletedAt: null,
          completed: true,
          isBreak: false,
        },
        _sum: { duration: true },
        _count: true,
      }),
      db.examAttempt.count({ where: { userId, deletedAt: null } }),
      db.examAttempt.findFirst({
        where: { userId, deletedAt: null },
        orderBy: { attemptedAt: 'desc' },
        select: {
          attemptedAt: true,
          totalScore: true,
          netScore: true,
          exam: { select: { name: true, code: true } },
        },
      }),
      db.examAttempt.findMany({
        where: { userId, deletedAt: null },
        orderBy: { attemptedAt: 'desc' },
        take: 10,
        select: {
          attemptedAt: true,
          totalScore: true,
          netScore: true,
        },
      }),
    ]);

    const totalStudyHours = studyHoursStats._sum.duration
      ? Math.round((studyHoursStats._sum.duration / 60) * 10) / 10
      : 0;
    const totalPomodoroSessions = studyHoursStats._count || 0;
    const recentAttemptsList = (recentAttemptsRaw ?? []) as Array<{ attemptedAt: Date; totalScore: unknown; netScore: unknown }>;
    const denemeSummary = {
      totalAttempts: denemeCount,
      lastAttemptAt: lastDeneme?.attemptedAt?.toISOString() ?? null,
      lastAttemptScore: lastDeneme?.totalScore != null ? Number(lastDeneme.totalScore) : null,
      lastAttemptNet: lastDeneme?.netScore != null ? Number(lastDeneme.netScore) : null,
      lastAttemptExamName: lastDeneme?.exam?.name ?? null,
      recentAttempts: recentAttemptsList.map((a) => ({
        attemptedAt: a.attemptedAt.toISOString(),
        totalScore: a.totalScore != null ? Number(a.totalScore) : null,
        netScore: a.netScore != null ? Number(a.netScore) : null,
      })),
    };

    // 3) Aktif sınava göre konu / ilerleme sayıları
    let totalTopics = 0;
    let totalSubjects = 0;
    let completedTopics = 0;
    let inProgressTopics = 0;
    let notStartedTopics = 0;
    let reviewedTopics = 0;

    if (activeExamAssignment?.exam?.id) {
      const examId = activeExamAssignment.exam.id;
      
      // OPTIMIZED: Run counts and topic fetch in parallel to reduce total query time
      const [topicsCount, subjectsCount, progressStats] = await Promise.all([
        prisma.topic.count({
          where: {
            subject: {
              section: { examId, deletedAt: null },
              deletedAt: null,
            },
            deletedAt: null,
          },
        }),
        prisma.subject.count({
          where: {
            section: { examId, deletedAt: null },
            deletedAt: null,
          },
        }),
        prisma.userProgress.groupBy({
          by: ['status'],
          where: {
            userId,
            topic: {
              subject: { section: { examId, deletedAt: null }, deletedAt: null },
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

    // 4) Haftalık çalışma: bu hafta (Pazartesi → Pazar), sabit gün sırası
    const dailyGoalMinutes = (user?.dailyStudyHours ?? 0) * 60;
    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']; // Pazartesi ile başla
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Pazar, 1=Pzt, ...
    const daysToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysToMonday);
    monday.setUTCHours(0, 0, 0, 0);

    const weeklyStudySummary: Array<{
      date: string;
      dayName: string;
      minutesStudied: number;
      goalMinutes: number;
      completed: boolean;
      hoursStudied: number;
      dayIndex: number;
    }> = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      weeklyStudySummary.push({
        date: dateStr,
        dayName: dayNames[i],
        minutesStudied: 0,
        goalMinutes: dailyGoalMinutes,
        completed: false,
        hoursStudied: 0,
        dayIndex: i,
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
      deneme: denemeSummary,
    };

    logApi('GET', '/api/dashboard/stats', HTTP_STATUS.OK, undefined, { userId });

    const res = NextResponse.json({
      success: true,
      data: stats,
    });
    // Kısa önbellek: tekrar ziyarette 10 sn cache, sonra arka planda yenile
    res.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');
    return res;
  } catch (error) {
    return handleError(error);
  }
}

export const GET = asyncHandler(getStatsHandler);
