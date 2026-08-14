'use client';

import type { ReactNode } from 'react';
import { SHOPIER_CHECKOUT_URL } from '@/config/constants';
import { trackMarketingEvent } from '@/lib/marketing/trackMarketingEvent';
import type { MarketingTouchpoint } from '@/lib/marketing/touchpoints';

type Props = {
  className?: string;
  children: ReactNode;
  target?: '_blank' | '_self';
  title?: string;
  touchpoint?: MarketingTouchpoint | string;
};

export function ShopierCheckoutLink({ className, children, target = '_blank', title, touchpoint }: Props) {
  return (
    <a
      href={SHOPIER_CHECKOUT_URL}
      className={className}
      title={title}
      target={target === '_blank' ? '_blank' : undefined}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      onClick={() =>
        trackMarketingEvent('begin_checkout', {
          touchpoint,
          checkout_provider: 'shopier',
        })
      }
    >
      {children}
    </a>
  );
}
