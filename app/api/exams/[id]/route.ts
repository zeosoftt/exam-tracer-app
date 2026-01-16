/**
 * Single Exam API Endpoint
 * GET /api/exams/[id] - Get exam
 * PUT /api/exams/[id] - Update exam
 * DELETE /api/exams/[id] - Delete exam (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { validate } from '@/lib/validation/validate';
import { updateExamSchema } from '@/lib/validation/schemas';
import { prisma } from '@/lib/db/prisma';
import { canUpdateExam, canViewExam, UserPermissions } from '@/lib/auth/permissions';
import { logApi } from '@/lib/logger';
import { HTTP_STATUS } from '@/config/constants';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '@/lib/errors/AppError';

async function getExamHandler(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const userPermissions: UserPermissions = {
      role: session.user.role as 'ADMIN' | 'INSTITUTION_ADMIN' | 'INDIVIDUAL' | 'VIEWER',
      institutionId: session.user.institutionId,
      userId: session.user.id,
    };

    const exam = await prisma.exam.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
      include: {
        subjects: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          include: {
            topics: {
              where: { deletedAt: null },
              orderBy: { order: 'asc' },
            },
          },
        },
        examAssignments: {
          where: { deletedAt: null },
        },
      },
    });

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    // Check permissions
    const examInstitutionId = exam.examAssignments.find((ea) => ea.institutionId)?.institutionId;
    if (!canViewExam(userPermissions, examInstitutionId)) {
      throw new ForbiddenError();
    }

    logApi('GET', `/api/exams/${params.id}`, HTTP_STATUS.OK, undefined, {
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: exam,
    });
  } catch (error) {
    return handleError(error);
  }
}

async function updateExamHandler(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const userPermissions: UserPermissions = {
      role: session.user.role as 'ADMIN' | 'INSTITUTION_ADMIN' | 'INDIVIDUAL' | 'VIEWER',
      institutionId: session.user.institutionId,
      userId: session.user.id,
    };

    const exam = await prisma.exam.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
      include: {
        examAssignments: {
          where: { deletedAt: null },
        },
      },
    });

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    const examInstitutionId = exam.examAssignments.find((ea) => ea.institutionId)?.institutionId;
    if (!canUpdateExam(userPermissions, examInstitutionId)) {
      throw new ForbiddenError();
    }

    const body = await req.json();
    const validatedData = validate(updateExamSchema, body);

    // Check code uniqueness if code is being updated
    if (validatedData.code && validatedData.code !== exam.code) {
      const existingExam = await prisma.exam.findFirst({
        where: {
          code: validatedData.code,
          deletedAt: null,
          id: { not: params.id },
        },
      });

      if (existingExam) {
        throw new Error('Exam code already exists');
      }
    }

    const updatedExam = await prisma.exam.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    logApi('PUT', `/api/exams/${params.id}`, HTTP_STATUS.OK, undefined, {
      userId: session.user.id,
      examId: params.id,
    });

    return NextResponse.json({
      success: true,
      data: updatedExam,
    });
  } catch (error) {
    return handleError(error);
  }
}

async function deleteExamHandler(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const userPermissions: UserPermissions = {
      role: session.user.role as 'ADMIN' | 'INSTITUTION_ADMIN' | 'INDIVIDUAL' | 'VIEWER',
      institutionId: session.user.institutionId,
      userId: session.user.id,
    };

    const exam = await prisma.exam.findFirst({
      where: {
        id: params.id,
        deletedAt: null,
      },
      include: {
        examAssignments: {
          where: { deletedAt: null },
        },
      },
    });

    if (!exam) {
      throw new NotFoundError('Exam not found');
    }

    const examInstitutionId = exam.examAssignments.find((ea) => ea.institutionId)?.institutionId;
    if (!canUpdateExam(userPermissions, examInstitutionId)) {
      throw new ForbiddenError();
    }

    // Soft delete
    await prisma.exam.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    logApi('DELETE', `/api/exams/${params.id}`, HTTP_STATUS.OK, undefined, {
      userId: session.user.id,
      examId: params.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Exam deleted successfully',
    });
  } catch (error) {
    return handleError(error);
  }
}

export const GET = asyncHandler(getExamHandler);
export const PUT = asyncHandler(updateExamHandler);
export const DELETE = asyncHandler(deleteExamHandler);
