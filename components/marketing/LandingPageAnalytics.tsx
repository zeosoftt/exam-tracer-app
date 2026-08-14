'use client';

import { useEffect } from 'react';
import { trackMarketingEvent } from '@/lib/marketing/trackMarketingEvent';

/** Landing mount — landing_view sayacı */
export function LandingPageAnalytics() {
  useEffect(() => {
    trackMarketingEvent('landing_view', { touchpoint: 'landing_home' });
  }, []);
  return null;
}
