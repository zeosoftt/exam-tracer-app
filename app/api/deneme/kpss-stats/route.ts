/**
 * GET /api/deneme/kpss-stats
 * KPSS denemelerinden GY ve GK için ortalama (μ) ve standart sapma (σ) döner.
 * Tüm kullanıcıların KPSS breakdown'lı denemeleri üzerinden hesaplanır.
 */

import { NextResponse } from 'next/server';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/db/prisma';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { getKpssPopulationStats } from '@/lib/utils/kpssStats';
import { denemeSiteDisabledResponse } from '@/lib/deneme/denemeAccess';

export const dynamic = 'force-dynamic';

async function getKpssStatsHandler(): Promise<NextResponse> {
  const session = await requireSession();
  const userId = getSessionUserId(session);

  const denied = await denemeSiteDisabledResponse();
  if (denied) return denied;

  const exam = await prisma.exam.findFirst({
    where: { code: 'KPSS', status: 'ACTIVE', deletedAt: null },
    select: { id: true },
  });

  if (!exam) {
    return NextResponse.json({
      success: true,
      data: {
        gyMean: 30,
        gyStd: 10,
        gkMean: 30,
        gkStd: 10,
        sampleSize: 0,
      },
    });
  }

  const stats = await getKpssPopulationStats(prisma, exam.id);
  const data = stats ?? {
    gyMean: 30,
    gyStd: 10,
    gkMean: 30,
    gkStd: 10,
    sampleSize: 0,
  };

  return NextResponse.json({ success: true, data });
}

export const GET = asyncHandler(getKpssStatsHandler);
