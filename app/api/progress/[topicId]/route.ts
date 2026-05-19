/**
 * Progress Update API
 * PATCH /api/progress/[topicId]
 * Updates user progress for a specific topic
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { prisma } from '@/lib/db/prisma';
import { logApi } from '@/lib/logger';
import { HTTP_STATUS } from '@/config/constants';
import { BadRequestError } from '@/lib/errors/AppError';
import { z } from 'zod';
import { ProgressStatus } from '@prisma/client';
import {
  advanceAfterReviewAcknowledged,
  computeInitialNextReview,
} from '@/lib/utils/spacedRepetition';

const updateProgressSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED']).optional(),
  totalQuestions: z.number().int().min(0).optional(),
  correctAnswers: z.number().int().min(0).optional(),
  wrongAnswers: z.number().int().min(0).optional(),
  /** Konu tamamlanmışken tekrarı yaptığını işaretle → aralıklı tekrar takvimini ilerlet */
  reviewCompleted: z.boolean().optional(),
});

async function updateProgressHandler(
  req: NextRequest,
  { params }: { params: { topicId: string } }
): Promise<NextResponse> {
  try {
    const session = await requireSession();
    const userId = getSessionUserId(session);
    const { topicId } = params;

    if (!topicId) {
      throw new BadRequestError('Topic ID is required');
    }

    const body = await req.json();
    const parsed = updateProgressSchema.parse(body);
    const { status, totalQuestions, correctAnswers, wrongAnswers, reviewCompleted } = parsed;

    const topic = await prisma.topic.findUnique({
      where: { id: topicId, deletedAt: null },
    });

    if (!topic) {
      throw new BadRequestError('Topic not found');
    }

    if (totalQuestions !== undefined && correctAnswers !== undefined && wrongAnswers !== undefined) {
      if (correctAnswers + wrongAnswers > totalQuestions) {
        throw new BadRequestError('Doğru + Yanlış sayısı toplam soru sayısını geçemez');
      }
    }

    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
    });

    if (reviewCompleted === true) {
      if (
        !existingProgress ||
        (existingProgress.status !== ProgressStatus.COMPLETED &&
          existingProgress.status !== ProgressStatus.REVIEWED)
      ) {
        throw new BadRequestError('Tekrar kaydı için konu tamamlanmış veya gözden geçirilmiş olmalıdır');
      }
      const now = new Date();
      const { nextLevel, nextReviewAt } = advanceAfterReviewAcknowledged(
        now,
        existingProgress.spacedRepetitionLevel
      );
      const updated = await prisma.userProgress.update({
        where: {
          userId_topicId: { userId, topicId },
        },
        data: {
          spacedRepetitionLevel: nextLevel,
          nextReviewAt,
          lastReviewedAt: now,
          updatedAt: now,
        },
      });
      logApi('PATCH', `/api/progress/${topicId}`, HTTP_STATUS.OK, undefined, {
        userId,
        topicId,
        reviewCompleted: true,
      });
      return NextResponse.json({ success: true, data: updated });
    }

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
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      } else if (status === 'REVIEWED') {
        updateData.completedAt = existingProgress?.completedAt ?? null;
      } else {
        updateData.completedAt = null;
      }
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

    const nextStatus =
      (updateData.status as ProgressStatus | undefined) ??
      existingProgress?.status ??
      ProgressStatus.NOT_STARTED;

    const srsClear = {
      spacedRepetitionLevel: 0,
      nextReviewAt: null as Date | null,
      lastReviewedAt: null as Date | null,
    };

    let srsPatch: {
      spacedRepetitionLevel?: number;
      nextReviewAt?: Date | null;
      lastReviewedAt?: Date | null;
    } = {};

    if (status !== undefined) {
      if (status === 'COMPLETED') {
        const completedAt = updateData.completedAt as Date;
        srsPatch = {
          spacedRepetitionLevel: 0,
          nextReviewAt: computeInitialNextReview(completedAt),
          lastReviewedAt: null,
        };
      } else if (status === 'REVIEWED') {
        srsPatch = {};
      } else {
        srsPatch = srsClear;
      }
    }

    const userProgress = await prisma.userProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
      update: {
        ...updateData,
        ...srsPatch,
        status: nextStatus,
        completedAt:
          updateData.completedAt !== undefined
            ? updateData.completedAt
            : (existingProgress?.completedAt ?? null),
        totalQuestions: updateData.totalQuestions ?? existingProgress?.totalQuestions ?? null,
        correctAnswers: updateData.correctAnswers ?? existingProgress?.correctAnswers ?? null,
        wrongAnswers: updateData.wrongAnswers ?? existingProgress?.wrongAnswers ?? null,
      },
      create: (() => {
        const ca = status === 'COMPLETED' ? new Date() : null;
        return {
          userId,
          topicId,
          status: (status as ProgressStatus) || ProgressStatus.NOT_STARTED,
          completedAt: ca,
          totalQuestions: totalQuestions ?? null,
          correctAnswers: correctAnswers ?? null,
          wrongAnswers: wrongAnswers ?? null,
          ...(ca
            ? {
                spacedRepetitionLevel: 0,
                nextReviewAt: computeInitialNextReview(ca),
                lastReviewedAt: null,
              }
            : {}),
        };
      })(),
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
