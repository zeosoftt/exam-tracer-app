/**
 * User Registration Endpoint
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { validate } from '@/lib/validation/validate';
import { registerSchema } from '@/lib/validation/schemas';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';
import { createFreemiumPersonalOrganization } from '@/lib/billing/createFreemiumOrganization';
import { logAuth, logError } from '@/lib/logger';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/config/constants';
import { ConflictError } from '@/lib/errors/AppError';
import { issueVerificationEmailForUser } from '@/lib/auth/issueVerificationEmail';

async function registerHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const validatedData = validate(registerSchema, body);

    // Check if email already exists (including soft-deleted users)
    // Email must be unique - even if user is soft-deleted, same email cannot be reused
    // Use findUnique since email is unique in schema
    const existingUser = await prisma.user.findUnique({
      where: {
        email: validatedData.email.toLowerCase(),
      },
    });

    // If user exists (even if soft-deleted), prevent registration
    // This ensures email uniqueness and prevents account takeover
    if (existingUser) {
      if (existingUser.deletedAt === null) {
        // Active user exists
        throw new ConflictError(ERROR_MESSAGES.EMAIL_EXISTS);
      } else {
        // Soft-deleted user exists - still prevent registration for security
        logAuth('Registration blocked: Email exists (soft-deleted)', existingUser.id, { 
          email: validatedData.email.toLowerCase() 
        });
        throw new ConflictError('Bu e-posta adresi daha önce kullanılmış. Lütfen farklı bir e-posta adresi deneyin.');
      }
    }


    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Find exam if examCode is provided (exam must exist in master data)
    let examId: string | undefined;
    if (validatedData.examCode) {
      const exam = await prisma.exam.findFirst({
        where: {
          code: validatedData.examCode.toUpperCase(),
          deletedAt: null,
        },
      });

      if (!exam) {
        // Exam should exist in master data, if not found log error but don't fail registration
        logError('Exam not found in master data', new Error(`Exam code not found: ${validatedData.examCode}`));
      } else {
        examId = exam.id;
      }
    }

    // Create user with onboarding data
    // Wrap in try-catch to handle Prisma unique constraint errors
    let user;
    try {
      user = await prisma.user.create({
        data: {
          email: validatedData.email.toLowerCase(),
          passwordHash,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          role: 'INDIVIDUAL',
          institutionId: validatedData.institutionId,
          targetScore: validatedData.targetScore,
          dailyStudyHours: validatedData.dailyStudyHours,
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
    } catch (createError: unknown) {
      // Handle Prisma unique constraint violation (P2002)
      const prismaError = createError as { code?: string; meta?: { target?: string[] } };
      if (prismaError?.code === 'P2002' && prismaError?.meta?.target?.includes('email')) {
        logAuth('Registration failed: Email unique constraint violation', undefined, { 
          email: validatedData.email.toLowerCase() 
        });
        throw new ConflictError(ERROR_MESSAGES.EMAIL_EXISTS);
      }
      // Re-throw other errors
      throw createError;
    }

    // Varsayılan Freemium: her yeni kullanıcı için kişisel organizasyon (FREE plan)
    try {
      await createFreemiumPersonalOrganization({
        userId: user.id,
        userName: `${validatedData.firstName ?? ''} ${validatedData.lastName ?? ''}`.trim(),
      });
    } catch (orgError) {
      logError('Freemium organization creation failed', orgError as Error);
      throw orgError;
    }

    // Create exam assignment if exam was found/created
    if (examId) {
      await prisma.examAssignment.create({
        data: {
          examId,
          userId: user.id,
        },
      });
    }

    logAuth('User registered', user.id, { email: user.email, examCode: validatedData.examCode });

    await issueVerificationEmailForUser(user.id);

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    return handleError(error);
  }
}

export const POST = asyncHandler(registerHandler);
