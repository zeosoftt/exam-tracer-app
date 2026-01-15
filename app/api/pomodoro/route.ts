/**
 * Pomodoro API
 * POST /api/pomodoro - Start a pomodoro session
 * GET /api/pomodoro - Get pomodoro history and stats
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

const startPomodoroSchema = z.object({
  duration: z.number().int().positive().default(25),
  isBreak: z.boolean().default(false),
});

async function startPomodoroHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const userId = session.user.id;
    const body = await req.json();
    const { duration, isBreak } = startPomodoroSchema.parse(body);

    // Create new pomodoro session
    const pomodoroSession = await prisma.pomodoroSession.create({
      data: {
        userId,
        duration,
        isBreak,
        completed: false,
        startedAt: new Date(),
      },
    });

    logApi('POST', '/api/pomodoro', HTTP_STATUS.CREATED, undefined, { userId, sessionId: pomodoroSession.id });

    return NextResponse.json({
      success: true,
      data: pomodoroSession,
    });
  } catch (error) {
    return handleError(error);
  }
}

async function getPomodoroHistoryHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Get pomodoro sessions
    const [sessions, total] = await Promise.all([
      prisma.pomodoroSession.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        orderBy: {
          startedAt: 'desc',
        },
        take: limit,
        skip,
      }),
      prisma.pomodoroSession.count({
        where: {
          userId,
          deletedAt: null,
        },
      }),
    ]);

    // Get statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());

    const stats = await prisma.pomodoroSession.aggregate({
      where: {
        userId,
        deletedAt: null,
        completed: true,
        isBreak: false, // Only count work sessions
      },
      _count: true,
      _sum: {
        duration: true,
      },
    });

    const todayStats = await prisma.pomodoroSession.aggregate({
      where: {
        userId,
        deletedAt: null,
        completed: true,
        isBreak: false,
        startedAt: {
          gte: today,
        },
      },
      _count: true,
      _sum: {
        duration: true,
      },
    });

    const weekStats = await prisma.pomodoroSession.aggregate({
      where: {
        userId,
        deletedAt: null,
        completed: true,
        isBreak: false,
        startedAt: {
          gte: thisWeek,
        },
      },
      _count: true,
      _sum: {
        duration: true,
      },
    });

    const totalStudyHours = (stats._sum.duration || 0) / 60; // Convert minutes to hours
    const todayStudyHours = (todayStats._sum.duration || 0) / 60;
    const weekStudyHours = (weekStats._sum.duration || 0) / 60;

    logApi('GET', '/api/pomodoro', HTTP_STATUS.OK, undefined, { userId });

    return NextResponse.json({
      success: true,
      data: {
        sessions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          totalSessions: stats._count || 0,
          totalStudyHours: Math.round(totalStudyHours * 10) / 10, // Round to 1 decimal
          todaySessions: todayStats._count || 0,
          todayStudyHours: Math.round(todayStudyHours * 10) / 10,
          weekSessions: weekStats._count || 0,
          weekStudyHours: Math.round(weekStudyHours * 10) / 10,
        },
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

export const POST = asyncHandler(startPomodoroHandler);
export const GET = asyncHandler(getPomodoroHistoryHandler);
