/**
 * Site ayarları (ana sayfa bölümleri, izleme kodları vb.)
 * Veritabanı key-value; yoksa varsayılan döner.
 */

import {
  ADSENSE_CLIENT_ID,
  DEFAULT_GTM_CONTAINER_ID,
  GA_MEASUREMENT_ID,
} from '@/lib/seo/siteSeo';
import { prisma } from '@/lib/db/prisma';

export const SITE_KEYS = {
  LANDING_SHOW_PARTNERS: 'landing_show_partners',
  /** Deneme sayfasında analiz + yeni kayıt formu (ders bazlı, KPSS, süre, not vb.) */
  DENEME_SHOW_ADVANCED: 'deneme_show_advanced',
  /** Shopier “satın al” tıklama sayacı (stringified integer) */
  SHOPIER_CHECKOUT_CLICKS: 'shopier_checkout_clicks',
  TRACKING_GTM_ENABLED: 'tracking_gtm_enabled',
  TRACKING_GA_ENABLED: 'tracking_ga_enabled',
  TRACKING_ADSENSE_ENABLED: 'tracking_adsense_enabled',
  GTM_CONTAINER_ID: 'gtm_container_id',
  GA_MEASUREMENT_ID: 'ga_measurement_id',
  ADSENSE_CLIENT_ID: 'adsense_client_id',
} as const;

const DEFAULTS: Record<string, string> = {
  [SITE_KEYS.LANDING_SHOW_PARTNERS]: 'false',
  [SITE_KEYS.DENEME_SHOW_ADVANCED]: 'true',
  [SITE_KEYS.SHOPIER_CHECKOUT_CLICKS]: '0',
  [SITE_KEYS.TRACKING_GTM_ENABLED]: 'false',
  [SITE_KEYS.TRACKING_GA_ENABLED]: 'true',
  [SITE_KEYS.TRACKING_ADSENSE_ENABLED]: 'true',
  [SITE_KEYS.GTM_CONTAINER_ID]: DEFAULT_GTM_CONTAINER_ID,
  [SITE_KEYS.GA_MEASUREMENT_ID]: GA_MEASUREMENT_ID,
  [SITE_KEYS.ADSENSE_CLIENT_ID]: ADSENSE_CLIENT_ID,
};

export type AdminSiteSettings = {
  landing_show_partners: boolean;
  deneme_show_advanced: boolean;
  tracking_gtm_enabled: boolean;
  tracking_ga_enabled: boolean;
  tracking_adsense_enabled: boolean;
  gtm_container_id: string;
  ga_measurement_id: string;
  adsense_client_id: string;
};

export type PublicTrackingConfig = {
  gtmEnabled: boolean;
  gtmContainerId: string;
  gaEnabled: boolean;
  gaMeasurementId: string;
  adsenseEnabled: boolean;
  adsenseClientId: string;
};

export async function getSetting(key: string): Promise<string> {
  const row = await prisma.siteSetting.findUnique({
    where: { key },
  });
  return row?.value ?? DEFAULTS[key] ?? '';
}

export async function getSettingBoolean(key: string): Promise<boolean> {
  const v = await getSetting(key);
  return v === 'true' || v === '1';
}

/**
 * Deneme sayfası: liste, import, kayıt formu ve analiz.
 * site_settings üzerinden kapatılabilir; varsayılan açık.
 */
export async function isDenemeAdvancedEnabled(): Promise<boolean> {
  return getSettingBoolean(SITE_KEYS.DENEME_SHOW_ADVANCED);
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function getAdminSiteSettings(): Promise<AdminSiteSettings> {
  const [
    landing_show_partners,
    deneme_show_advanced,
    tracking_gtm_enabled,
    tracking_ga_enabled,
    tracking_adsense_enabled,
    gtm_container_id,
    ga_measurement_id,
    adsense_client_id,
  ] = await Promise.all([
    getSettingBoolean(SITE_KEYS.LANDING_SHOW_PARTNERS),
    getSettingBoolean(SITE_KEYS.DENEME_SHOW_ADVANCED),
    getSettingBoolean(SITE_KEYS.TRACKING_GTM_ENABLED),
    getSettingBoolean(SITE_KEYS.TRACKING_GA_ENABLED),
    getSettingBoolean(SITE_KEYS.TRACKING_ADSENSE_ENABLED),
    getSetting(SITE_KEYS.GTM_CONTAINER_ID),
    getSetting(SITE_KEYS.GA_MEASUREMENT_ID),
    getSetting(SITE_KEYS.ADSENSE_CLIENT_ID),
  ]);

  return {
    landing_show_partners,
    deneme_show_advanced,
    tracking_gtm_enabled,
    tracking_ga_enabled,
    tracking_adsense_enabled,
    gtm_container_id,
    ga_measurement_id,
    adsense_client_id,
  };
}

/** @deprecated use getAdminSiteSettings */
export async function getAllLandingSectionSettings(): Promise<Record<string, boolean>> {
  const s = await getAdminSiteSettings();
  return {
    [SITE_KEYS.LANDING_SHOW_PARTNERS]: s.landing_show_partners,
    [SITE_KEYS.DENEME_SHOW_ADVANCED]: s.deneme_show_advanced,
  };
}

export async function getPublicTrackingConfig(): Promise<PublicTrackingConfig> {
  const s = await getAdminSiteSettings();
  return {
    gtmEnabled: s.tracking_gtm_enabled,
    gtmContainerId: s.gtm_container_id.trim(),
    gaEnabled: s.tracking_ga_enabled,
    gaMeasurementId: s.ga_measurement_id.trim(),
    adsenseEnabled: s.tracking_adsense_enabled,
    adsenseClientId: s.adsense_client_id.trim(),
  };
}

/** Shopier “satın al” tıklama sayacı (admin istatistiği). */
export async function getShopierCheckoutClickCount(): Promise<number> {
  const v = await getSetting(SITE_KEYS.SHOPIER_CHECKOUT_CLICKS);
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export async function incrementShopierCheckoutClick(): Promise<void> {
  const current = await getShopierCheckoutClickCount();
  await setSetting(SITE_KEYS.SHOPIER_CHECKOUT_CLICKS, String(current + 1));
}
