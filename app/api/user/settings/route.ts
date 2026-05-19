/**
 * User Settings API — ince handler; veri erişimi settingsRepository (DRY).
 */

import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/validation/validate';
import { updateUserSettingsSchema } from '@/lib/validation/schemas';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { HTTP_STATUS } from '@/config/constants';
import {
  clearUserActiveExam,
  findUserSettings,
  setUserActiveExam,
  updateUserProfile,
} from '@/lib/settings/settingsRepository';

async function getSettingsHandler(): Promise<NextResponse> {
  const session = await requireSession();
  const data = await findUserSettings(getSessionUserId(session));
  if (!data) {
    return NextResponse.json({ success: false, error: { message: 'Kullanıcı bulunamadı' } }, { status: 401 });
  }
  return NextResponse.json({ success: true, data });
}

async function patchSettingsHandler(req: NextRequest): Promise<NextResponse> {
  const session = await requireSession();
  const userId = getSessionUserId(session);
  const validated = validate(updateUserSettingsSchema, await req.json());

  await updateUserProfile(userId, {
    firstName: validated.firstName,
    lastName: validated.lastName,
    targetScore: validated.targetScore,
    dailyStudyHours: validated.dailyStudyHours,
  });

  if (validated.examId !== undefined) {
    if (validated.examId === '') {
      await clearUserActiveExam(userId);
    } else {
      const ok = await setUserActiveExam(userId, validated.examId);
      if (!ok) {
        return NextResponse.json(
          { success: false, error: { message: 'Geçersiz sınav' } },
          { status: HTTP_STATUS.BAD_REQUEST },
        );
      }
    }
  }

  const data = await findUserSettings(userId);
  return NextResponse.json({ success: true, data });
}

export const GET = asyncHandler(getSettingsHandler);
export const PATCH = asyncHandler(patchSettingsHandler);
