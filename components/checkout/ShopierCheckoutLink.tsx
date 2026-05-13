'use client';

import type { ReactNode } from 'react';
import { SHOPIER_CHECKOUT_URL } from '@/config/constants';
import { trackShopierCheckoutClick } from '@/lib/client-api/analyticsClient';

type Props = {
  className?: string;
  children: ReactNode;
  /** Varsayılan: yeni sekmede Shopier */
  target?: '_blank' | '_self';
  title?: string;
};

function trackClick() {
  void trackShopierCheckoutClick();
}

export function ShopierCheckoutLink({ className, children, target = '_blank', title }: Props) {
  return (
    <a
      href={SHOPIER_CHECKOUT_URL}
      className={className}
      title={title}
      target={target === '_blank' ? '_blank' : undefined}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      onClick={trackClick}
    >
      {children}
    </a>
  );
}
