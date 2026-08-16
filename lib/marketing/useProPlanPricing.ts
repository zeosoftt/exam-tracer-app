'use client';

import { useEffect, useState } from 'react';
import { PRO_PLAN_BILLING_PERIOD, PRO_PLAN_PRICE_TRY, SHOPIER_CHECKOUT_URL } from '@/config/constants';
import { buildProPlanPriceLabels } from '@/lib/marketing/pricingDisplay';
import type { PublicPricingConfig } from '@/lib/siteSettings';

const FALLBACK: PublicPricingConfig = {
  priceTry: PRO_PLAN_PRICE_TRY,
  billingPeriod: PRO_PLAN_BILLING_PERIOD,
  ...buildProPlanPriceLabels(PRO_PLAN_PRICE_TRY, PRO_PLAN_BILLING_PERIOD),
  shopierCheckoutUrl: SHOPIER_CHECKOUT_URL,
};

export function useProPlanPricing() {
  const [pricing, setPricing] = useState<PublicPricingConfig>(FALLBACK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetch('/api/site/pricing', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { success?: boolean; data?: PublicPricingConfig } | null) => {
        if (cancelled || !json?.success || !json.data) return;
        setPricing(json.data);
      })
      .catch(() => {
        /* fallback */
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { ...pricing, loaded };
}
