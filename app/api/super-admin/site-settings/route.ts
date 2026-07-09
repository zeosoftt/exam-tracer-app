/**
 * Super Admin - Site ayarları (ana sayfa bölümleri, izleme kodları)
 * GET: ayarları döner, PATCH: günceller. Sadece ADMIN.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminHandler } from '@/lib/api/withAdminHandler';
import {
  getAdminSiteSettings,
  setSetting,
  SITE_KEYS,
} from '@/lib/siteSettings';
import { validate } from '@/lib/validation/validate';
import { adminSiteSettingsPatchSchema } from '@/lib/validation/schemas';

async function getSiteSettingsHandler(): Promise<NextResponse> {
  const settings = await getAdminSiteSettings();
  return NextResponse.json({ success: true, data: settings });
}

async function patchSiteSettingsHandler(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const patch = validate(adminSiteSettingsPatchSchema, body);

  if (typeof patch.landing_show_partners === 'boolean') {
    await setSetting(
      SITE_KEYS.LANDING_SHOW_PARTNERS,
      patch.landing_show_partners ? 'true' : 'false',
    );
  }

  if (typeof patch.deneme_show_advanced === 'boolean') {
    await setSetting(
      SITE_KEYS.DENEME_SHOW_ADVANCED,
      patch.deneme_show_advanced ? 'true' : 'false',
    );
  }

  if (typeof patch.tracking_gtm_enabled === 'boolean') {
    await setSetting(
      SITE_KEYS.TRACKING_GTM_ENABLED,
      patch.tracking_gtm_enabled ? 'true' : 'false',
    );
  }

  if (typeof patch.tracking_ga_enabled === 'boolean') {
    await setSetting(
      SITE_KEYS.TRACKING_GA_ENABLED,
      patch.tracking_ga_enabled ? 'true' : 'false',
    );
  }

  if (typeof patch.tracking_adsense_enabled === 'boolean') {
    await setSetting(
      SITE_KEYS.TRACKING_ADSENSE_ENABLED,
      patch.tracking_adsense_enabled ? 'true' : 'false',
    );
  }

  if (patch.gtm_container_id !== undefined) {
    await setSetting(SITE_KEYS.GTM_CONTAINER_ID, patch.gtm_container_id.trim());
  }

  if (patch.ga_measurement_id !== undefined) {
    await setSetting(SITE_KEYS.GA_MEASUREMENT_ID, patch.ga_measurement_id.trim());
  }

  if (patch.adsense_client_id !== undefined) {
    await setSetting(SITE_KEYS.ADSENSE_CLIENT_ID, patch.adsense_client_id.trim());
  }

  const settings = await getAdminSiteSettings();
  return NextResponse.json({ success: true, data: settings });
}

export const GET = withAdminHandler(getSiteSettingsHandler);
export const PATCH = withAdminHandler(patchSiteSettingsHandler, 'super_admin.site_settings.update');
