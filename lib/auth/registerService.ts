/**
 * Kayıt iş mantığı — tek transactional akış.
 */

import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';
import { createFreemiumPersonalOrganization } from '@/lib/billing/createFreemiumOrganization';
import { issueVerificationEmailForUser } from '@/lib/auth/issueVerificationEmail';
import { logAuth, logError } from '@/lib/logger';
import { ERROR_MESSAGES } from '@/config/constants';
import { ConflictError } from '@/lib/errors/AppError';
import type { z } from 'zod';
import type { registerSchema } from '@/lib/validation/schemas';

export type RegisterInput = z.infer<typeof registerSchema>;

export type RegisterResult = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string | null;
  targetScore: number | null;
  dailyStudyHours: number | null;
  createdAt: Date;
};

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const email = input.email.toLowerCase();

  logAuth('Registration started', undefined, { emailHash: email.slice(0, 3) + '***' });

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    if (existingUser.deletedAt === null) {
      logAuth('Registration denied: duplicate email', existingUser.id);
      throw new ConflictError(ERROR_MESSAGES.EMAIL_EXISTS);
    }
    logAuth('Registration blocked: soft-deleted email', existingUser.id);
    throw new ConflictError('Bu e-posta adresi daha önce kullanılmış. Lütfen farklı bir e-posta adresi deneyin.');
  }

  const passwordHash = await hashPassword(input.password);
  const acquisitionSource = input.acquisitionSource?.trim() || null;
  const acquisitionSourceDetail =
    acquisitionSource === 'OTHER' ? input.acquisitionSourceDetail?.trim() || null : null;

  let examId: string | undefined;
  if (input.examCode) {
    const exam = await prisma.exam.findFirst({
      where: { code: input.examCode.toUpperCase(), deletedAt: null },
    });
    if (!exam) {
      logError('Registration: exam code not in catalog', new Error(`Missing exam: ${input.examCode}`));
    } else {
      examId = exam.id;
    }
  }

  let user: RegisterResult;
  try {
    user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          role: 'INDIVIDUAL',
          institutionId: input.institutionId,
          targetScore: input.targetScore,
          dailyStudyHours: input.dailyStudyHours,
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
          userName: `${input.firstName ?? ''} ${input.lastName ?? ''}`.trim(),
        },
        tx,
      );

      if (examId) {
        await tx.examAssignment.create({ data: { examId, userId: created.id } });
      }

      return created;
    });
  } catch (createError: unknown) {
    const prismaError = createError as { code?: string; meta?: { target?: string[] } };
    if (prismaError?.code === 'P2002' && prismaError?.meta?.target?.includes('email')) {
      logAuth('Registration failed: unique constraint', undefined, { emailHash: email.slice(0, 3) + '***' });
      throw new ConflictError(ERROR_MESSAGES.EMAIL_EXISTS);
    }
    throw createError;
  }

  logAuth('Registration completed', user.id, {
    role: user.role,
    hasExamAssignment: Boolean(examId),
  });

  await issueVerificationEmailForUser(user.id);
  logAuth('Verification email queued', user.id);

  return user;
}
