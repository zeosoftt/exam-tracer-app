/**
 * Dashboard Detail API
 * GET /api/dashboard/detail
 * Returns section and subject progress for active exam
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { prisma } from '@/lib/db/prisma';
import { logApi } from '@/lib/logger';
import { HTTP_STATUS } from '@/config/constants';
import { UnauthorizedError } from '@/lib/errors/AppError';

async function getDetailHandler(_req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const userId = session.user.id;

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

    if (!activeExamAssignment?.exam?.id) {
      return NextResponse.json({
        success: true,
        data: {
          exam: null,
          sections: [],
        },
      });
    }

    const examId = activeExamAssignment.exam.id;

    // Get all sections for this exam
    const sections = await prisma.section.findMany({
      where: {
        examId: examId,
        deletedAt: null,
      },
      include: {
        subjects: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            order: 'asc',
          },
          include: {
            topics: {
              where: {
                deletedAt: null,
              },
              orderBy: {
                order: 'asc',
              },
              select: {
                id: true,
                code: true,
                name: true,
                order: true,
              },
            },
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Get user progress for all topics in this exam
    const userProgress = await prisma.userProgress.findMany({
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
      select: {
        topicId: true,
        status: true,
      },
    });

    // Create a map of topicId -> status for quick lookup
    const progressMap = new Map(
      userProgress.map((progress) => [progress.topicId, progress.status])
    );

    // Calculate progress for each section and subject
    const sectionsWithProgress = sections.map((section) => {
      const sectionTopics: string[] = [];
      const sectionCompleted: string[] = [];
      const sectionInProgress: string[] = [];
      const sectionNotStarted: string[] = [];
      const sectionReviewed: string[] = [];

      const subjectsWithProgress = section.subjects.map((subject) => {
        const subjectTopics: string[] = [];
        const subjectCompleted: string[] = [];
        const subjectInProgress: string[] = [];
        const subjectNotStarted: string[] = [];
        const subjectReviewed: string[] = [];

        // Map topics with their status
        const topicsWithStatus = subject.topics.map((topic) => {
          sectionTopics.push(topic.id);
          subjectTopics.push(topic.id);
          const status = progressMap.get(topic.id) || 'NOT_STARTED';
          
          // Count by status
          // REVIEWED durumunu COMPLETED olarak say
          const normalizedStatus = status === 'REVIEWED' ? 'COMPLETED' : status;
          const finalStatus = normalizedStatus === 'COMPLETED' 
            ? 'COMPLETED' 
            : normalizedStatus === 'IN_PROGRESS' 
            ? 'IN_PROGRESS' 
            : 'NOT_STARTED';
          
          if (finalStatus === 'COMPLETED' || status === 'REVIEWED') {
            sectionCompleted.push(topic.id);
            subjectCompleted.push(topic.id);
          } else if (finalStatus === 'IN_PROGRESS') {
            sectionInProgress.push(topic.id);
            subjectInProgress.push(topic.id);
          } else {
            sectionNotStarted.push(topic.id);
            subjectNotStarted.push(topic.id);
          }
          
          if (status === 'REVIEWED') {
            sectionReviewed.push(topic.id);
            subjectReviewed.push(topic.id);
          }
          
          return {
            id: topic.id,
            code: topic.code,
            name: topic.name,
            order: topic.order,
            status: finalStatus as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED',
          };
        });

        const subjectTotal = subjectTopics.length;
        const subjectCompletedCount = subjectCompleted.length;
        const subjectInProgressCount = subjectInProgress.length;
        const subjectNotStartedCount = subjectNotStarted.length;
        const subjectReviewedCount = subjectReviewed.length;
        
        // Progress: completed + reviewed as completed
        const subjectProgress =
          subjectTotal > 0 ? Math.round(((subjectCompletedCount + subjectReviewedCount) / subjectTotal) * 100) : 0;

        return {
          id: subject.id,
          code: subject.code,
          name: subject.name,
          order: subject.order,
          totalTopics: subjectTotal,
          completedTopics: subjectCompletedCount,
          inProgressTopics: subjectInProgressCount,
          notStartedTopics: subjectNotStartedCount,
          reviewedTopics: subjectReviewedCount,
          progressPercentage: subjectProgress,
          topics: topicsWithStatus,
        };
      });

      const sectionTotal = sectionTopics.length;
      const sectionCompletedCount = sectionCompleted.length;
      const sectionInProgressCount = sectionInProgress.length;
      const sectionNotStartedCount = sectionNotStarted.length;
      const sectionReviewedCount = sectionReviewed.length;
      
      // Progress: completed + reviewed as completed
      const sectionProgress =
        sectionTotal > 0 ? Math.round(((sectionCompletedCount + sectionReviewedCount) / sectionTotal) * 100) : 0;

      return {
        id: section.id,
        code: section.code,
        name: section.name,
        order: section.order,
        totalTopics: sectionTotal,
        completedTopics: sectionCompletedCount,
        inProgressTopics: sectionInProgressCount,
        notStartedTopics: sectionNotStartedCount,
        reviewedTopics: sectionReviewedCount,
        progressPercentage: sectionProgress,
        subjects: subjectsWithProgress,
      };
    });

    logApi('GET', '/api/dashboard/detail', HTTP_STATUS.OK, undefined, { userId });

    return NextResponse.json({
      success: true,
      data: {
        exam: activeExamAssignment.exam,
        sections: sectionsWithProgress,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export const GET = asyncHandler(getDetailHandler);
