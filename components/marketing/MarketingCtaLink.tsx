'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { trackMarketingEvent } from '@/lib/marketing/trackMarketingEvent';
import type { MarketingTouchpoint } from '@/lib/marketing/touchpoints';

type Props = ComponentProps<typeof Link> & {
  touchpoint: MarketingTouchpoint;
  ctaLabel?: string;
};

/** Landing CTA — tıklama + yönlendirme (first-party + GTM) */
export function MarketingCtaLink({ touchpoint, ctaLabel, onClick, href, ...rest }: Props) {
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        trackMarketingEvent('cta_click', { touchpoint });
        if (process.env.NODE_ENV === 'development' && ctaLabel) {
          // ctaLabel yalnızca debug; prod sayaca gitmez
          console.debug('[cta_click]', touchpoint, ctaLabel);
        }
        onClick?.(e);
      }}
    />
  );
}
