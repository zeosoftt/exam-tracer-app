/**
 * GET /api/deneme/[id] — Tek deneme kaydı detayı
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { HTTP_STATUS } from '@/config/constants';
import { denemeDetailAccessDeniedResponse, denemeSiteDisabledResponse } from '@/lib/deneme/denemeAccess';
import {
  findUserDenemeAttemptById,
  mapDenemeAttemptToDto,
  softDeleteUserDenemeAttempt,
} from '@/lib/deneme/denemeRepository';

async function getDenemeByIdHandler(
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

  const attempt = await findUserDenemeAttemptById(userId, id);
  if (!attempt) {
    return NextResponse.json({ success: false, error: 'Deneme kaydı bulunamadı.' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  return NextResponse.json({ success: true, data: mapDenemeAttemptToDto(attempt) });
}

async function deleteDenemeByIdHandler(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await requireSession();
  const userId = getSessionUserId(session);

  const disabled = await denemeSiteDisabledResponse();
  if (disabled) return disabled;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Kayıt bulunamadı.' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const deleted = await softDeleteUserDenemeAttempt(userId, id);
  if (!deleted) {
    return NextResponse.json({ success: false, error: 'Deneme kaydı bulunamadı.' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  return NextResponse.json({ success: true, data: { id } });
}

export const GET = asyncHandler(getDenemeByIdHandler);
export const DELETE = asyncHandler(deleteDenemeByIdHandler);
