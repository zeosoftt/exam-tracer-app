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

async function getStatsHandler(req: NextRequest): Promise<NextResponse> {
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
    let examWhere: any = { deletedAt: null };
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
      
      // Count all topics across all sections of this exam
      // This query counts topics from ALL sections of the exam (e.g., Genel Yetenek + Genel Kültür for KPSS)
      const topicsCount = await prisma.topic.count({
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
      });
      totalTopics = topicsCount;

      // Count all subjects across all sections of this exam
      const subjectsCount = await prisma.subject.count({
        where: {
          section: {
            examId: examId,
            deletedAt: null,
          },
          deletedAt: null,
        },
      });
      totalSubjects = subjectsCount;

      // Get all topic IDs for this exam
      const examTopics = await prisma.topic.findMany({
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
      });

      const examTopicIds = examTopics.map((t) => t.id);

      // Get progress stats only for topics in this active exam
      const progressStats = await prisma.userProgress.groupBy({
        by: ['status'],
        where: {
          userId,
          topicId: {
            in: examTopicIds,
          },
          deletedAt: null,
        },
        _count: true,
      });

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
