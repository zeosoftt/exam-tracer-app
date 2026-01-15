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

    // Get progress stats
    const progressStats = await prisma.userProgress.groupBy({
      by: ['status'],
      where: {
        userId,
        deletedAt: null,
      },
      _count: true,
    });

    const completedTopics = progressStats.find((s) => s.status === 'COMPLETED')?._count || 0;
    const inProgressTopics = progressStats.find((s) => s.status === 'IN_PROGRESS')?._count || 0;
    const notStartedTopics = progressStats.find((s) => s.status === 'NOT_STARTED')?._count || 0;
    const reviewedTopics = progressStats.find((s) => s.status === 'REVIEWED')?._count || 0;

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

    // Get total topics count for active exam
    let totalTopics = 0;
    if (activeExamAssignment?.exam?.id) {
      const topicsCount = await prisma.topic.count({
        where: {
          subject: {
            section: {
              examId: activeExamAssignment.exam.id,
              deletedAt: null,
            },
            deletedAt: null,
          },
          deletedAt: null,
        },
      });
      totalTopics = topicsCount;
    }

    const stats = {
      totalExams,
      activeExams,
      completedTopics,
      inProgressTopics,
      notStartedTopics,
      reviewedTopics,
      totalTopics,
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
