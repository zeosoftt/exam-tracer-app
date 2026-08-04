/**
 * Subjects API Endpoint
 * GET /api/subjects - List subjects
 * POST /api/subjects - Create subject
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, getSessionUserId, toUserPermissions } from '@/lib/auth/requireSession';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { validate } from '@/lib/validation/validate';
import { createSubjectSchema } from '@/lib/validation/schemas';
import { prisma } from '@/lib/db/prisma';
import { canCreateExam } from '@/lib/auth/permissions';
import { userCanViewExam } from '@/lib/exams/examAccessRepository';
import { logApi } from '@/lib/logger';
import { HTTP_STATUS } from '@/config/constants';
import { ForbiddenError, NotFoundError } from '@/lib/errors/AppError';

async function getSubjectsHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    const userId = getSessionUserId(session);

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

    const userPermissions = toUserPermissions(session);
    const canView = await userCanViewExam(userId, examId, userPermissions, null);
    if (!canView) {
      throw new ForbiddenError();
    }

    const subjects = await prisma.subject.findMany({
      where: {
        section: {
          examId,
          deletedAt: null,
        },
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

    logApi('GET', '/api/subjects', HTTP_STATUS.OK, undefined, { userId });

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
    const session = await requireSession();
    const userId = getSessionUserId(session);

    const userPermissions = toUserPermissions(session);

    if (!canCreateExam(userPermissions)) {
      throw new ForbiddenError();
    }

    const body = await req.json();
    const validatedData = validate(createSubjectSchema, body);

    // Verify section exists
    const section = await prisma.section.findFirst({
      where: {
        id: validatedData.sectionId,
        deletedAt: null,
      },
      include: {
        exam: true,
      },
    });

    if (!section) {
      throw new NotFoundError('Section not found');
    }

    // Check if code already exists for this section
    const existingSubject = await prisma.subject.findFirst({
      where: {
        sectionId: validatedData.sectionId,
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
      userId,
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
