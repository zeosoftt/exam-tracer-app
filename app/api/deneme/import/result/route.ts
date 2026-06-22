/**
 * POST /api/deneme/import/result — Kurum deneme sonuç linkinden veri çeker
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession } from '@/lib/auth/requireSession';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { HTTP_STATUS } from '@/config/constants';
import { denemeSiteDisabledResponse } from '@/lib/deneme/denemeAccess';
import { fetchInstitutionResult } from '@/lib/deneme/institutionResult/fetchInstitutionResult';

const bodySchema = z.object({
  url: z.string().min(10, 'Sonuç linki girin.'),
});

async function postInstitutionResultImportHandler(req: NextRequest): Promise<NextResponse> {
  await requireSession();

  const denied = await denemeSiteDisabledResponse();
  if (denied) return denied;

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten().fieldErrors.url?.[0] ?? 'Geçersiz istek.' },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  try {
    const data = await fetchInstitutionResult(parsed.data.url);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Kurum sonucu alınamadı.';
    return NextResponse.json({ success: false, error: message }, { status: HTTP_STATUS.BAD_REQUEST });
  }
}

export const POST = asyncHandler(postInstitutionResultImportHandler);
