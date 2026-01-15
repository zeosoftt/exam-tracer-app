/**
 * Pomodoro Session API
 * PATCH /api/pomodoro/[sessionId] - Complete a pomodoro session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { prisma } from '@/lib/db/prisma';
import { logApi } from '@/lib/logger';
import { HTTP_STATUS } from '@/config/constants';
import { UnauthorizedError, BadRequestError, NotFoundError } from '@/lib/errors/AppError';

async function completePomodoroHandler(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const userId = session.user.id;
    const { sessionId } = params;

    if (!sessionId) {
      throw new BadRequestError('Session ID is required');
    }

    // Verify session exists and belongs to user
    const pomodoroSession = await prisma.pomodoroSession.findFirst({
      where: {
        id: sessionId,
        userId,
        deletedAt: null,
      },
    });

    if (!pomodoroSession) {
      throw new NotFoundError('Pomodoro session not found');
    }

    if (pomodoroSession.completed) {
      throw new BadRequestError('Pomodoro session already completed');
    }

    // Complete the session
    const updatedSession = await prisma.pomodoroSession.update({
      where: { id: sessionId },
      data: {
        completed: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    logApi('PATCH', `/api/pomodoro/${sessionId}`, HTTP_STATUS.OK, undefined, { userId, sessionId });

    return NextResponse.json({
      success: true,
      data: updatedSession,
    });
  } catch (error) {
    return handleError(error);
  }
}

export const PATCH = asyncHandler(completePomodoroHandler);
