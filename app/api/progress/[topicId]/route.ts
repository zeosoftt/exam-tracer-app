/**
 * Progress Update API
 * PATCH /api/progress/[topicId]
 * Updates user progress for a specific topic
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { prisma } from '@/lib/db/prisma';
import { logApi } from '@/lib/logger';
import { HTTP_STATUS } from '@/config/constants';
import { UnauthorizedError, BadRequestError } from '@/lib/errors/AppError';
import { z } from 'zod';

const updateProgressSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
});

async function updateProgressHandler(
  req: NextRequest,
  { params }: { params: { topicId: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const userId = session.user.id;
    const { topicId } = params;

    if (!topicId) {
      throw new BadRequestError('Topic ID is required');
    }

    const body = await req.json();
    const { status } = updateProgressSchema.parse(body);

    // Verify topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId, deletedAt: null },
    });

    if (!topic) {
      throw new BadRequestError('Topic not found');
    }

    // Update or create user progress
    const userProgress = await prisma.userProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
      update: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        topicId,
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    logApi('PATCH', `/api/progress/${topicId}`, HTTP_STATUS.OK, undefined, { userId, topicId, status });

    return NextResponse.json({
      success: true,
      data: userProgress,
    });
  } catch (error) {
    return handleError(error);
  }
}

export const PATCH = asyncHandler(updateProgressHandler);
