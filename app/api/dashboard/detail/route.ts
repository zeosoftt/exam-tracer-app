/**
 * Dashboard Detail API
 * GET /api/dashboard/detail
 * Returns section and subject progress for active exam
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { prisma } from '@/lib/db/prisma';
import { buildDashboardDetailData } from '@/lib/services/dashboard/dashboardDetailService';
import { logApi } from '@/lib/logger';
import { HTTP_STATUS } from '@/config/constants';
import { UnauthorizedError } from '@/lib/errors/AppError';

export const dynamic = 'force-dynamic';

type DetailApiPayload = {
  success: true;
  data: {
    exam: unknown;
    sections: unknown[];
    evaluation: unknown;
  };
};

const DETAIL_CACHE_TTL_MS = 10_000;
const detailCache = new Map<string, { expiresAt: number; payload: DetailApiPayload }>();

async function getDetailHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    const userId = getSessionUserId(session);
    const forceRefresh = req.nextUrl.searchParams.get('fresh') === '1';
    if (!forceRefresh) {
      const cached = detailCache.get(userId);
      if (cached && cached.expiresAt > Date.now()) {
        const res = NextResponse.json(cached.payload);
        res.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');
        res.headers.set('X-Detail-Cache', 'HIT');
        return res;
      }
    }

    const result = await buildDashboardDetailData(prisma, userId);

    if (!result.user) {
      throw new UnauthorizedError();
    }

    const { detail } = result;
    const noActiveExam =
      detail.exam === null &&
      Array.isArray(detail.sections) &&
      detail.sections.length === 0;

    if (noActiveExam) {
      return NextResponse.json({
        success: true,
        data: detail,
      });
    }

    const payload: DetailApiPayload = {
      success: true,
      data: detail,
    };

    logApi('GET', '/api/dashboard/detail', HTTP_STATUS.OK, undefined, { userId });

    detailCache.set(userId, {
      expiresAt: Date.now() + DETAIL_CACHE_TTL_MS,
      payload,
    });

    const res = NextResponse.json(payload);
    res.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');
    res.headers.set('X-Detail-Cache', 'MISS');
    return res;
  } catch (error) {
    return handleError(error);
  }
}

export const GET = asyncHandler(getDetailHandler);
