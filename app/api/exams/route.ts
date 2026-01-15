/**
 * Exams API Endpoint
 * GET /api/exams - List exams
 * POST /api/exams - Create exam
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { validate } from '@/lib/validation/validate';
import { createExamSchema, paginationSchema } from '@/lib/validation/schemas';
import { prisma } from '@/lib/db/prisma';
import { canCreateExam, canViewExam, UserPermissions } from '@/lib/auth/permissions';
import { logApi, logError } from '@/lib/logger';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/config/constants';
import { ForbiddenError, UnauthorizedError, ConflictError } from '@/lib/errors/AppError';
import { getPaginationParams, getSkip, createPaginatedResponse } from '@/lib/utils/pagination';

async function getExamsHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const userPermissions: UserPermissions = {
      role: session.user.role as any,
      institutionId: session.user.institutionId,
      userId: session.user.id,
    };

    const { searchParams } = new URL(req.url);
    const pagination = validate(paginationSchema, {
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
    });

    const { page, pageSize } = getPaginationParams(pagination.page, pagination.pageSize);
    const skip = getSkip(page, pageSize);

    // Build where clause based on user role
    const where: any = {
      deletedAt: null,
    };

    // Non-admin users can only see assigned exams
    if (!canCreateExam(userPermissions)) {
      where.examAssignments = {
        some: {
          OR: [
            { userId: session.user.id },
            { institutionId: session.user.institutionId },
          ],
          deletedAt: null,
        },
      };
    }

    const [exams, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          examAssignments: {
            where: { deletedAt: null },
            select: {
              institutionId: true,
              userId: true,
            },
          },
        },
      }),
      prisma.exam.count({ where }),
    ]);

    const response = createPaginatedResponse(exams, total, page, pageSize);
    logApi('GET', '/api/exams', HTTP_STATUS.OK, undefined, { userId: session.user.id });

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    return handleError(error);
  }
}

async function createExamHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const userPermissions: UserPermissions = {
      role: session.user.role as any,
      institutionId: session.user.institutionId,
      userId: session.user.id,
    };

    if (!canCreateExam(userPermissions)) {
      throw new ForbiddenError();
    }

    const body = await req.json();
    const validatedData = validate(createExamSchema, body);

    // Check if code already exists
    const existingExam = await prisma.exam.findFirst({
      where: {
        code: validatedData.code.toUpperCase(),
        deletedAt: null,
      },
    });

    if (existingExam) {
      throw new ConflictError('Bu sınav kodu zaten kullanılıyor');
    }

    const exam = await prisma.exam.create({
      data: {
        name: validatedData.name,
        code: validatedData.code.toUpperCase(),
        description: validatedData.description,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
      },
    });

    logApi('POST', '/api/exams', HTTP_STATUS.CREATED, undefined, {
      userId: session.user.id,
      examId: exam.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: exam,
      },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    return handleError(error);
  }
}

export const GET = asyncHandler(getExamsHandler);
export const POST = asyncHandler(createExamHandler);
