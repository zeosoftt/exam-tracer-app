/**
 * User Settings API
 * GET: current user profile and active exam
 * PATCH: update profile (firstName, lastName, targetScore, dailyStudyHours, examId)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { validate } from '@/lib/validation/validate';
import { updateUserSettingsSchema } from '@/lib/validation/schemas';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { UnauthorizedError } from '@/lib/errors/AppError';
import { HTTP_STATUS } from '@/config/constants';

async function getSettingsHandler(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      targetScore: true,
      dailyStudyHours: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError();
  }

  const activeAssignment = await prisma.examAssignment.findFirst({
    where: {
      userId,
      deletedAt: null,
      exam: { status: 'ACTIVE', deletedAt: null },
    },
    orderBy: { assignedAt: 'desc' },
    include: {
      exam: { select: { id: true, name: true, code: true } },
    },
  });

  const activeExam = activeAssignment?.exam ?? null;

  return NextResponse.json({
    success: true,
    data: {
      user: {
        ...user,
        name: `${user.firstName} ${user.lastName}`.trim(),
      },
      activeExam,
    },
  });
}

async function patchSettingsHandler(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  const userId = session.user.id;

  const body = await req.json();
  const validated = validate(updateUserSettingsSchema, body);

  const updateData: {
    firstName?: string;
    lastName?: string;
    targetScore?: number | null;
    dailyStudyHours?: number | null;
  } = {};
  if (validated.firstName !== undefined) updateData.firstName = validated.firstName;
  if (validated.lastName !== undefined) updateData.lastName = validated.lastName;
  if (validated.targetScore !== undefined) updateData.targetScore = validated.targetScore;
  if (validated.dailyStudyHours !== undefined) updateData.dailyStudyHours = validated.dailyStudyHours;

  if (Object.keys(updateData).length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  if (validated.examId !== undefined) {
    const currentAssignment = await prisma.examAssignment.findFirst({
      where: { userId, deletedAt: null },
      orderBy: { assignedAt: 'desc' },
    });

    if (validated.examId === '') {
      if (currentAssignment) {
        await prisma.examAssignment.update({
          where: { id: currentAssignment.id },
          data: { deletedAt: new Date() },
        });
      }
    } else {
      const exam = await prisma.exam.findFirst({
        where: { id: validated.examId, status: 'ACTIVE', deletedAt: null },
      });
      if (!exam) {
        return NextResponse.json(
          { success: false, error: { message: 'Geçersiz sınav' } },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
      if (currentAssignment?.examId !== validated.examId) {
        if (currentAssignment) {
          await prisma.examAssignment.update({
            where: { id: currentAssignment.id },
            data: { deletedAt: new Date() },
          });
        }
        await prisma.examAssignment.create({
          data: {
            examId: exam.id,
            userId,
          },
        });
      }
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      targetScore: true,
      dailyStudyHours: true,
    },
  });

  const activeAssignment = await prisma.examAssignment.findFirst({
    where: { userId, deletedAt: null, exam: { status: 'ACTIVE', deletedAt: null } },
    orderBy: { assignedAt: 'desc' },
    include: { exam: { select: { id: true, name: true, code: true } } },
  });

  return NextResponse.json({
    success: true,
    data: {
      user: user ? { ...user, name: `${user.firstName} ${user.lastName}`.trim() } : null,
      activeExam: activeAssignment?.exam ?? null,
    },
  });
}

export const GET = asyncHandler(getSettingsHandler);
export const PATCH = asyncHandler(patchSettingsHandler);
