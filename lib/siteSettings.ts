/**
 * Site ayarları (ana sayfa bölümleri aç/kapa vb.)
 * Veritabanı key-value; yoksa varsayılan döner.
 */

import { prisma } from '@/lib/db/prisma';

export const SITE_KEYS = {
  LANDING_SHOW_PARTNERS: 'landing_show_partners',
} as const;

const DEFAULTS: Record<string, string> = {
  [SITE_KEYS.LANDING_SHOW_PARTNERS]: 'true',
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
  const partners = await getSettingBoolean(SITE_KEYS.LANDING_SHOW_PARTNERS);
  return {
    [SITE_KEYS.LANDING_SHOW_PARTNERS]: partners,
  };
}
