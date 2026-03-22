/**
 * GET /api/deneme/kpss-stats
 * KPSS denemelerinden GY ve GK için ortalama (μ) ve standart sapma (σ) döner.
 * Tüm kullanıcıların KPSS breakdown'lı denemeleri üzerinden hesaplanır.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { UnauthorizedError } from '@/lib/errors/AppError';
import { getKpssPopulationStats } from '@/lib/utils/kpssStats';

async function getKpssStatsHandler(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

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
