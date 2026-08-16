import { PRO_PLAN_BILLING_PERIOD, PRO_PLAN_PRICE_TRY } from '@/config/constants';

/** Türk Lirası fiyat gösterimi (ör. 99 ₺) */
export function formatTryPrice(amount: number): string {
  const hasCents = amount % 1 !== 0;
  return `${amount.toLocaleString('tr-TR', {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })} ₺`;
}

export function buildProPlanPriceLabels(priceTry: number, billingPeriod: string) {
  const priceLabel = formatTryPrice(priceTry);
  return {
    priceLabel,
    priceLabelWithPeriod: `${priceLabel} / ${billingPeriod}`,
  };
}

/** Varsayılan sabitler — site_settings yokken fallback */
export function getProPlanPriceLabel(options?: { withPeriod?: boolean }): string {
  const labels = buildProPlanPriceLabels(PRO_PLAN_PRICE_TRY, PRO_PLAN_BILLING_PERIOD);
  return options?.withPeriod ? labels.priceLabelWithPeriod : labels.priceLabel;
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
