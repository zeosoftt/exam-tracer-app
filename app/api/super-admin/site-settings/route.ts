/**
 * Super Admin - Site ayarları (ana sayfa bölümleri, izleme kodları)
 * GET: ayarları döner, PATCH: günceller. Sadece ADMIN.
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminSession } from '@/lib/auth/requireSession';
import {
  getAdminSiteSettings,
  setSetting,
  SITE_KEYS,
  type AdminSiteSettings,
} from '@/lib/siteSettings';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/config/constants';

function normalizeId(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed;
}

export async function GET() {
  const guard = await guardAdminSession();
  if (!guard.authorized) return guard.response;

  try {
    const settings = await getAdminSiteSettings();
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
    const body = (await req.json()) as Partial<AdminSiteSettings>;

    if (typeof body.landing_show_partners === 'boolean') {
      await setSetting(
        SITE_KEYS.LANDING_SHOW_PARTNERS,
        body.landing_show_partners ? 'true' : 'false'
      );
    }

    if (typeof body.deneme_show_advanced === 'boolean') {
      await setSetting(
        SITE_KEYS.DENEME_SHOW_ADVANCED,
        body.deneme_show_advanced ? 'true' : 'false'
      );
    }

    if (typeof body.tracking_gtm_enabled === 'boolean') {
      await setSetting(
        SITE_KEYS.TRACKING_GTM_ENABLED,
        body.tracking_gtm_enabled ? 'true' : 'false'
      );
    }

    if (typeof body.tracking_ga_enabled === 'boolean') {
      await setSetting(
        SITE_KEYS.TRACKING_GA_ENABLED,
        body.tracking_ga_enabled ? 'true' : 'false'
      );
    }

    if (typeof body.tracking_adsense_enabled === 'boolean') {
      await setSetting(
        SITE_KEYS.TRACKING_ADSENSE_ENABLED,
        body.tracking_adsense_enabled ? 'true' : 'false'
      );
    }

    const gtmId = normalizeId(body.gtm_container_id);
    if (gtmId !== undefined) {
      await setSetting(SITE_KEYS.GTM_CONTAINER_ID, gtmId);
    }

    const gaId = normalizeId(body.ga_measurement_id);
    if (gaId !== undefined) {
      await setSetting(SITE_KEYS.GA_MEASUREMENT_ID, gaId);
    }

    const adsenseId = normalizeId(body.adsense_client_id);
    if (adsenseId !== undefined) {
      await setSetting(SITE_KEYS.ADSENSE_CLIENT_ID, adsenseId);
    }

    const settings = await getAdminSiteSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('Site settings PATCH error:', error);
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.INTERNAL_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
