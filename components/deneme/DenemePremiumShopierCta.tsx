'use client';

import { Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ProPlanPriceText } from '@/components/marketing/ProPlanPriceText';
import { MARKETING_TOUCHPOINTS } from '@/lib/marketing/touchpoints';

const ShopierCheckoutLink = dynamic(
  () => import('@/components/checkout/ShopierCheckoutLink').then((m) => m.ShopierCheckoutLink),
  { ssr: false, loading: () => null },
);

type Props = {
  className?: string;
  touchpoint?: string;
};

export function DenemePremiumShopierCta({
  className,
  touchpoint = MARKETING_TOUCHPOINTS.DENEME_LIST_WALL,
}: Props) {
  return (
    <ShopierCheckoutLink touchpoint={touchpoint} className={className}>
      <Sparkles className="h-4 w-4" />
      Pro&apos;yu Shopier&apos;da satın al — <ProPlanPriceText withPeriod />
    </ShopierCheckoutLink>
  );
}
