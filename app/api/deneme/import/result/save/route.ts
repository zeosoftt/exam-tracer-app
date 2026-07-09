/**
 * POST /api/deneme/import/result/save — Kurum sonucunu deneme kaydı olarak ekler
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { HTTP_STATUS, RATE_LIMIT } from '@/config/constants';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { denemeSiteDisabledResponse } from '@/lib/deneme/denemeAccess';
import { createAttemptFromInstitutionResult } from '@/lib/deneme/institutionResult/createAttemptFromInstitutionResult';
import { institutionResultImportSchema } from '@/lib/deneme/institutionResult/importSchema';

const bodySchema = z.object({
  url: z.string().min(10, 'Sonuç linki girin.'),
  examId: z.string().min(1, 'Sınav seçiniz.'),
  importData: institutionResultImportSchema.optional(),
});

const saveLimiter = rateLimit(10, RATE_LIMIT.WINDOW_MS);

async function postInstitutionResultSaveHandler(req: NextRequest): Promise<NextResponse> {
  const limited = saveLimiter(req);
  if (limited) return limited;

  const session = await requireSession();
  const userId = getSessionUserId(session);

  const denied = await denemeSiteDisabledResponse();
  if (denied) return denied;

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const message =
      fieldErrors.url?.[0] ??
      fieldErrors.examId?.[0] ??
      fieldErrors.importData?.[0] ??
      'Geçersiz istek.';
    return NextResponse.json({ success: false, error: message }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  try {
    const data = await createAttemptFromInstitutionResult({
      userId,
      examId: parsed.data.examId,
      sourceUrl: parsed.data.url,
      importData: parsed.data.importData,
    });
    return NextResponse.json({ success: true, data }, { status: HTTP_STATUS.CREATED });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Deneme kaydı oluşturulamadı.';
    return NextResponse.json({ success: false, error: message }, { status: HTTP_STATUS.BAD_REQUEST });
  }
}

export const POST = asyncHandler(postInstitutionResultSaveHandler);
