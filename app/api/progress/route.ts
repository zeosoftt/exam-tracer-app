/**
 * User Progress API Endpoint
 * GET /api/progress - Get user progress
 * POST /api/progress - Update progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { validate } from '@/lib/validation/validate';
import { updateProgressSchema, paginationSchema } from '@/lib/validation/schemas';
import { prisma } from '@/lib/db/prisma';
import { logApi } from '@/lib/logger';
import { HTTP_STATUS } from '@/config/constants';
import { UnauthorizedError, NotFoundError } from '@/lib/errors/AppError';
import { getPaginationParams, getSkip, createPaginatedResponse } from '@/lib/utils/pagination';

async function getProgressHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const { searchParams } = new URL(req.url);
    const pagination = validate(paginationSchema, {
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
    });

    const { page, pageSize } = getPaginationParams(pagination.page, pagination.pageSize);
    const skip = getSkip(page, pageSize);

    const topicId = searchParams.get('topicId');
    const status = searchParams.get('status');

    const where: any = {
      userId: session.user.id,
      deletedAt: null,
    };

    if (topicId) {
      where.topicId = topicId;
    }

    if (status) {
      where.status = status;
    }

    const [progress, total] = await Promise.all([
      prisma.userProgress.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        include: {
          topic: {
            include: {
              subject: {
                include: {
                  exam: true,
                },
              },
            },
          },
        },
      }),
      prisma.userProgress.count({ where }),
    ]);

    const response = createPaginatedResponse(progress, total, page, pageSize);
    logApi('GET', '/api/progress', HTTP_STATUS.OK, undefined, { userId: session.user.id });

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    return handleError(error);
  }
}

async function updateProgressHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const body = await req.json();
    const validatedData = validate(updateProgressSchema, body);

    // Verify topic exists
    const topic = await prisma.topic.findFirst({
      where: {
        id: validatedData.topicId,
        deletedAt: null,
      },
    });

    if (!topic) {
      throw new NotFoundError('Topic not found');
    }

    // Upsert progress
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_topicId: {
          userId: session.user.id,
          topicId: validatedData.topicId,
        },
      },
      update: {
        status: validatedData.status,
        notes: validatedData.notes,
        completedAt: validatedData.status === 'COMPLETED' ? new Date() : null,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        topicId: validatedData.topicId,
        status: validatedData.status,
        notes: validatedData.notes,
        completedAt: validatedData.status === 'COMPLETED' ? new Date() : null,
      },
    });

    logApi('POST', '/api/progress', HTTP_STATUS.OK, undefined, {
      userId: session.user.id,
      topicId: validatedData.topicId,
    });

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    return handleError(error);
  }
}

export const GET = asyncHandler(getProgressHandler);
export const POST = asyncHandler(updateProgressHandler);
