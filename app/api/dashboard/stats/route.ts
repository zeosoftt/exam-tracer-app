/**
 * Dashboard Stats API
 * GET /api/dashboard/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { prisma } from '@/lib/db/prisma';
import { buildDashboardStatsData } from '@/lib/services/dashboard/dashboardStatsService';
import { logApi } from '@/lib/logger';
import { HTTP_STATUS } from '@/config/constants';
import { UnauthorizedError } from '@/lib/errors/AppError';

export const dynamic = 'force-dynamic';

type StatsApiPayload = {
  success: true;
  data: unknown;
};

const STATS_CACHE_TTL_MS = 10_000;
const statsCache = new Map<string, { expiresAt: number; payload: StatsApiPayload }>();

async function getStatsHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    const institutionId = session.user.institutionId;
    const forceRefresh = req.nextUrl.searchParams.get('fresh') === '1';
    const scope = req.nextUrl.searchParams.get('scope') ?? (req.nextUrl.searchParams.get('lite') === '1' ? 'core' : 'full');
    const isCoreScope = scope === 'core';
    const cacheKey = `${userId}:${isCoreScope ? 'core' : 'full'}`;

    if (!forceRefresh) {
      const cached = statsCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        const res = NextResponse.json(cached.payload);
        res.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');
        res.headers.set('X-Stats-Cache', 'HIT');
        return res;
      }
    }

    const stats = await buildDashboardStatsData(prisma, {
      userId,
      userRole,
      institutionId,
      isCoreScope,
    });

    logApi('GET', '/api/dashboard/stats', HTTP_STATUS.OK, undefined, { userId });

    const payload: StatsApiPayload = {
      success: true,
      data: stats,
    };
    statsCache.set(cacheKey, {
      expiresAt: Date.now() + STATS_CACHE_TTL_MS,
      payload,
    });

    const res = NextResponse.json(payload);
    res.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');
    res.headers.set('X-Stats-Cache', 'MISS');
    return res;
  } catch (error) {
    return handleError(error);
  }
}

export const GET = asyncHandler(getStatsHandler);
