/**
 * Birleşik pazarlama olayı — GTM/GA4 + first-party sayaç (dashboard dahil).
 */

import { postMarketingEvent } from '@/lib/client-api/marketingAnalyticsClient';
import type { MarketingEventName, MarketingEventParams } from '@/lib/marketing/marketingEventTypes';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

function pushToGtm(event: MarketingEventName, params?: MarketingEventParams): void {
  if (typeof window === 'undefined') return;
  const payload = { event, ...params };
  try {
    window.dataLayer?.push(payload);
  } catch {
    // non-blocking
  }
  try {
    window.gtag?.('event', event, params ?? {});
  } catch {
    // non-blocking
  }
}

export function trackMarketingEvent(event: MarketingEventName, params?: MarketingEventParams): void {
  pushToGtm(event, params);
  void postMarketingEvent(event, params);
}

/** Premium duvarı — bir kez say (session başına) */
export function trackPremiumWallViewOnce(touchpoint: string): void {
  if (typeof window === 'undefined') return;
  const key = `premium_wall:${touchpoint}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    // sessionStorage yoksa yine say
  }
  trackMarketingEvent('premium_wall_view', { touchpoint });
}
