/**
 * Subjects API Endpoint
 * GET /api/subjects - List subjects
 * POST /api/subjects - Create subject
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { validate } from '@/lib/validation/validate';
import { createSubjectSchema, paginationSchema } from '@/lib/validation/schemas';
import { prisma } from '@/lib/db/prisma';
import { canCreateExam, UserPermissions } from '@/lib/auth/permissions';
import { logApi } from '@/lib/logger';
import { HTTP_STATUS } from '@/config/constants';
import { ForbiddenError, UnauthorizedError, NotFoundError } from '@/lib/errors/AppError';
import { getPaginationParams, getSkip, createPaginatedResponse } from '@/lib/utils/pagination';

async function getSubjectsHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');

    if (!examId) {
      throw new Error('examId is required');
    }

    // Verify exam exists and user has access
    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        deletedAt: null,
      },
    });

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    const subjects = await prisma.subject.findMany({
      where: {
        examId,
        deletedAt: null,
      },
      orderBy: { order: 'asc' },
      include: {
        topics: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
    });

    logApi('GET', '/api/subjects', HTTP_STATUS.OK, undefined, { userId: session.user.id });

    return NextResponse.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    return handleError(error);
  }
}

async function createSubjectHandler(req: NextRequest): Promise<NextResponse> {
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
    const validatedData = validate(createSubjectSchema, body);

    // Verify exam exists
    const exam = await prisma.exam.findFirst({
      where: {
        id: validatedData.examId,
        deletedAt: null,
      },
    });

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    // Check if code already exists for this exam
    const existingSubject = await prisma.subject.findFirst({
      where: {
        examId: validatedData.examId,
        code: validatedData.code,
        deletedAt: null,
      },
    });

    if (existingSubject) {
      throw new Error('Subject code already exists for this exam');
    }

    const subject = await prisma.subject.create({
      data: validatedData,
      include: {
        topics: true,
      },
    });

    logApi('POST', '/api/subjects', HTTP_STATUS.CREATED, undefined, {
      userId: session.user.id,
      subjectId: subject.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: subject,
      },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    return handleError(error);
  }
}

export const GET = asyncHandler(getSubjectsHandler);
export const POST = asyncHandler(createSubjectHandler);
