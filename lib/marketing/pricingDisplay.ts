import { PRO_PLAN_PRICE_TRY } from '@/config/constants';

/** Türk Lirası fiyat gösterimi (ör. 29,99 ₺) */
export function formatTryPrice(amount: number): string {
  return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`;
}

export function getProPlanPriceLabel(options?: { withPeriod?: boolean }): string {
  const price = formatTryPrice(PRO_PLAN_PRICE_TRY);
  return options?.withPeriod ? `${price} / ay` : price;
}

export const PRO_PLAN_MARKETING_FEATURES = [
  'Deneme detayı, ders/konu analizi',
  'ÖSYM uyumlu puan hesaplama ve net trendi',
  'Gelişmiş analitik ve raporlar',
] as const;

export const PRO_PLAN_LANDING_FEATURES = [
  'Ücretsiz plandaki her şey',
  ...PRO_PLAN_MARKETING_FEATURES,
] as const;
