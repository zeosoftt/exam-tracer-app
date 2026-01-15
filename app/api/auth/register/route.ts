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
import { logAuth, logError } from '@/lib/logger';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/config/constants';
import { ConflictError } from '@/lib/errors/AppError';

async function registerHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const validatedData = validate(registerSchema, body);

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email.toLowerCase(),
        deletedAt: null,
      },
    });

    if (existingUser) {
      throw new ConflictError(ERROR_MESSAGES.EMAIL_EXISTS);
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
    const user = await prisma.user.create({
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
