/**
 * Available Exams API Endpoint (Public)
 * GET /api/exams/available - List all active exams for onboarding
 */

import { NextResponse } from 'next/server';
import { asyncHandler, handleError } from '../../../../lib/errors/errorHandler';
import { prisma } from '../../../../lib/db/prisma';
import { logApi } from '../../../../lib/logger';
import { HTTP_STATUS } from '../../../../config/constants';
import { EXAM_SCORE_RANGES } from '@/lib/constants/examScoreRanges';

async function getAvailableExamsHandler(): Promise<NextResponse> {
  try {
    // Get all active exams
    const exams = await prisma.exam.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Add score ranges to exams
    const examsWithRanges = exams.map((exam) => {
      const scoreRange = EXAM_SCORE_RANGES[exam.code] ?? { minScore: 0, maxScore: 100, step: 1 };
      return {
        ...exam,
        ...scoreRange,
      };
    });

    logApi('GET', '/api/exams/available', HTTP_STATUS.OK);

    return NextResponse.json({
      success: true,
      data: examsWithRanges,
    });
  } catch (error) {
    return handleError(error);
  }
}

export const GET = asyncHandler(getAvailableExamsHandler);
