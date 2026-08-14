'use client';

import { useEffect } from 'react';
import { trackPremiumWallViewOnce } from '@/lib/marketing/trackMarketingEvent';

export function PremiumWallTracker({ touchpoint }: { touchpoint: string }) {
  useEffect(() => {
    trackPremiumWallViewOnce(touchpoint);
  }, [touchpoint]);
  return null;
}
