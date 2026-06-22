/**
 * GET /api/deneme/[id]/analysis — Konu bilgisi × deneme performansı analizi
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { HTTP_STATUS } from '@/config/constants';
import { denemeDetailAccessDeniedResponse } from '@/lib/deneme/denemeAccess';
import { buildDenemeAnalysisForAttempt } from '@/lib/deneme/analysis/buildDenemeAnalysisForAttempt';

async function getDenemeAnalysisHandler(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await requireSession();
  const userId = getSessionUserId(session);

  const denied = await denemeDetailAccessDeniedResponse(userId);
  if (denied) return denied;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Kayıt bulunamadı.' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const analysis = await buildDenemeAnalysisForAttempt(userId, id);
  if (!analysis) {
    return NextResponse.json(
      {
        success: false,
        error: 'Bu deneme için analiz üretilemedi. Ders/konu verisi eksik olabilir.',
      },
      { status: HTTP_STATUS.NOT_FOUND },
    );
  }

  return NextResponse.json({ success: true, data: analysis });
}

export const GET = asyncHandler(getDenemeAnalysisHandler);
