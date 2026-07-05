/**
 * User Registration Endpoint
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { validate } from '@/lib/validation/validate';
import { registerSchema } from '@/lib/validation/schemas';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';
import { createFreemiumPersonalOrganization } from '@/lib/billing/createFreemiumOrganization';
import { logAuth, logError } from '@/lib/logger';
import { ERROR_MESSAGES } from '@/config/constants';
import { ConflictError } from '@/lib/errors/AppError';
import { issueVerificationEmailForUser } from '@/lib/auth/issueVerificationEmail';
import { jsonCreated } from '@/lib/api/responses';

async function registerHandler(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const validatedData = validate(registerSchema, body);

  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email.toLowerCase() },
  });

  if (existingUser) {
    if (existingUser.deletedAt === null) {
      throw new ConflictError(ERROR_MESSAGES.EMAIL_EXISTS);
    }
    logAuth('Registration blocked: Email exists (soft-deleted)', existingUser.id, {
      email: validatedData.email.toLowerCase(),
    });
    throw new ConflictError('Bu e-posta adresi daha önce kullanılmış. Lütfen farklı bir e-posta adresi deneyin.');
  }

  const passwordHash = await hashPassword(validatedData.password);

  const acquisitionSource = validatedData.acquisitionSource?.trim() || null;
  const acquisitionSourceDetail =
    acquisitionSource === 'OTHER' ? validatedData.acquisitionSourceDetail?.trim() || null : null;

  let examId: string | undefined;
  if (validatedData.examCode) {
    const exam = await prisma.exam.findFirst({
      where: {
        code: validatedData.examCode.toUpperCase(),
        deletedAt: null,
      },
    });

    if (!exam) {
      logError('Exam not found in master data', new Error(`Exam code not found: ${validatedData.examCode}`));
    } else {
      examId = exam.id;
    }
  }

  let user;
  try {
    user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: validatedData.email.toLowerCase(),
          passwordHash,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          role: 'INDIVIDUAL',
          institutionId: validatedData.institutionId,
          targetScore: validatedData.targetScore,
          dailyStudyHours: validatedData.dailyStudyHours,
          acquisitionSource,
          acquisitionSourceDetail,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          targetScore: true,
          dailyStudyHours: true,
          createdAt: true,
        },
      });

      await createFreemiumPersonalOrganization(
        {
          userId: created.id,
          userName: `${validatedData.firstName ?? ''} ${validatedData.lastName ?? ''}`.trim(),
        },
        tx,
      );

      if (examId) {
        await tx.examAssignment.create({
          data: { examId, userId: created.id },
        });
      }

      return created;
    });
  } catch (createError: unknown) {
    const prismaError = createError as { code?: string; meta?: { target?: string[] } };
    if (prismaError?.code === 'P2002' && prismaError?.meta?.target?.includes('email')) {
      logAuth('Registration failed: Email unique constraint violation', undefined, {
        email: validatedData.email.toLowerCase(),
      });
      throw new ConflictError(ERROR_MESSAGES.EMAIL_EXISTS);
    }
    throw createError;
  }

  logAuth('User registered', user.id, { email: user.email, examCode: validatedData.examCode });
  await issueVerificationEmailForUser(user.id);

  return jsonCreated(user);
}

export const POST = asyncHandler(registerHandler);
