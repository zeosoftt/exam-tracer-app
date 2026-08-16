'use client';

import { useProPlanPricing } from '@/lib/marketing/useProPlanPricing';
import { getProPlanPriceLabel } from '@/lib/marketing/pricingDisplay';

type Props = {
  withPeriod?: boolean;
  className?: string;
};

export function ProPlanPriceText({ withPeriod = false, className }: Props) {
  const { priceLabel, priceLabelWithPeriod, loaded } = useProPlanPricing();
  const text = withPeriod ? priceLabelWithPeriod : priceLabel;
  const fallback = getProPlanPriceLabel({ withPeriod });

  return <span className={className}>{loaded ? text : fallback}</span>;
}
