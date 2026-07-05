'use client';

import dynamic from 'next/dynamic';
import { Sparkles } from 'lucide-react';

const ShopierCheckoutLink = dynamic(
  () => import('@/components/checkout/ShopierCheckoutLink').then((m) => m.ShopierCheckoutLink),
  { ssr: false, loading: () => null },
);

type Props = {
  className?: string;
};

export function DenemePremiumShopierCta({ className }: Props) {
  return (
    <ShopierCheckoutLink className={className}>
      <Sparkles className="h-4 w-4" />
      Pro&apos;yu Shopier&apos;da satın al
    </ShopierCheckoutLink>
  );
}
