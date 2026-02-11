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
import { ProgressStatus } from '@prisma/client';

const updateProgressSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional(),
  totalQuestions: z.number().int().min(0).optional(),
  correctAnswers: z.number().int().min(0).optional(),
  wrongAnswers: z.number().int().min(0).optional(),
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
    const parsed = updateProgressSchema.parse(body);
    const { status, totalQuestions, correctAnswers, wrongAnswers } = parsed;

    // Verify topic exists
    const topic = await prisma.topic.findUnique({
      where: { id: topicId, deletedAt: null },
    });

    if (!topic) {
      throw new BadRequestError('Topic not found');
    }

    // Validate question statistics
    if (totalQuestions !== undefined && correctAnswers !== undefined && wrongAnswers !== undefined) {
      if (correctAnswers + wrongAnswers > totalQuestions) {
        throw new BadRequestError('Doğru + Yanlış sayısı toplam soru sayısını geçemez');
      }
    }

    // Prepare update data
    const updateData: {
      status?: string;
      completedAt?: Date | null;
      totalQuestions?: number | null;
      correctAnswers?: number | null;
      wrongAnswers?: number | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (status !== undefined) {
      updateData.status = status;
      updateData.completedAt = status === 'COMPLETED' ? new Date() : null;
    }

    if (totalQuestions !== undefined) {
      updateData.totalQuestions = totalQuestions;
    }

    if (correctAnswers !== undefined) {
      updateData.correctAnswers = correctAnswers;
    }

    if (wrongAnswers !== undefined) {
      updateData.wrongAnswers = wrongAnswers;
    }

    // Get existing progress to preserve fields
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
    });

    // Update or create user progress
    const userProgress = await prisma.userProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
      update: {
        ...updateData,
        // Preserve existing values if not provided
        status: (updateData.status as ProgressStatus) ?? existingProgress?.status ?? ProgressStatus.NOT_STARTED,
        completedAt: updateData.completedAt !== undefined 
          ? updateData.completedAt 
          : existingProgress?.completedAt ?? null,
        totalQuestions: updateData.totalQuestions ?? existingProgress?.totalQuestions ?? null,
        correctAnswers: updateData.correctAnswers ?? existingProgress?.correctAnswers ?? null,
        wrongAnswers: updateData.wrongAnswers ?? existingProgress?.wrongAnswers ?? null,
      },
      create: {
        userId,
        topicId,
        status: (status as ProgressStatus) || ProgressStatus.NOT_STARTED,
        completedAt: status === 'COMPLETED' ? new Date() : null,
        totalQuestions: totalQuestions ?? null,
        correctAnswers: correctAnswers ?? null,
        wrongAnswers: wrongAnswers ?? null,
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
