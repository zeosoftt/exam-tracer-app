/**
 * Super Admin - Site ayarları (ana sayfa bölümleri aç/kapa)
 * GET: ayarları döner, PATCH: günceller. Sadece ADMIN.
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminSession } from '@/lib/auth/requireSession';
import {
  getAllLandingSectionSettings,
  setSetting,
  SITE_KEYS,
} from '@/lib/siteSettings';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/config/constants';

export async function GET() {
  const guard = await guardAdminSession();
  if (!guard.authorized) return guard.response;

  try {
    const settings = await getAllLandingSectionSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Site settings GET error:', error);
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.INTERNAL_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await guardAdminSession();
  if (!guard.authorized) return guard.response;

  try {
    const body = await req.json();
    const { landing_show_partners, deneme_show_advanced } = body as {
      landing_show_partners?: boolean;
      deneme_show_advanced?: boolean;
    };

    if (typeof landing_show_partners === 'boolean') {
      await setSetting(
        SITE_KEYS.LANDING_SHOW_PARTNERS,
        landing_show_partners ? 'true' : 'false'
      );
    }

    if (typeof deneme_show_advanced === 'boolean') {
      await setSetting(
        SITE_KEYS.DENEME_SHOW_ADVANCED,
        deneme_show_advanced ? 'true' : 'false'
      );
    }

    const settings = await getAllLandingSectionSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Site settings PATCH error:', error);
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.INTERNAL_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
