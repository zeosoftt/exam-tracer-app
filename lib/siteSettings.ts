/**
 * Site ayarları (ana sayfa bölümleri aç/kapa vb.)
 * Veritabanı key-value; yoksa varsayılan döner.
 */

import { prisma } from '@/lib/db/prisma';

export const SITE_KEYS = {
  LANDING_SHOW_PARTNERS: 'landing_show_partners',
  /** Deneme sayfasında analiz + yeni kayıt formu (ders bazlı, KPSS, süre, not vb.) */
  DENEME_SHOW_ADVANCED: 'deneme_show_advanced',
  /** Shopier satın alma butonuna toplam tıklama sayısı (stringified integer) */
  SHOPIER_CHECKOUT_CLICKS: 'shopier_checkout_clicks',
} as const;

const DEFAULTS: Record<string, string> = {
  [SITE_KEYS.LANDING_SHOW_PARTNERS]: 'true',
  [SITE_KEYS.DENEME_SHOW_ADVANCED]: 'false',
  [SITE_KEYS.SHOPIER_CHECKOUT_CLICKS]: '0',
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

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function getAllLandingSectionSettings(): Promise<Record<string, boolean>> {
  const [partners, denemeAdvanced] = await Promise.all([
    getSettingBoolean(SITE_KEYS.LANDING_SHOW_PARTNERS),
    getSettingBoolean(SITE_KEYS.DENEME_SHOW_ADVANCED),
  ]);
  return {
    [SITE_KEYS.LANDING_SHOW_PARTNERS]: partners,
    [SITE_KEYS.DENEME_SHOW_ADVANCED]: denemeAdvanced,
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
