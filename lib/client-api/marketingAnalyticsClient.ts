/**
 * Client-side marketing analytics — server counters + GTM.
 */

import type { MarketingEventName, MarketingEventParams } from '@/lib/marketing/marketingEventTypes';

export async function postMarketingEvent(
  event: MarketingEventName,
  params?: MarketingEventParams,
): Promise<void> {
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        touchpoint: params?.touchpoint,
        step: params?.step,
        exam_code: params?.exam_code,
      }),
      keepalive: true,
    });
  } catch {
    // non-blocking
  }
}

/** @deprecated use trackMarketingEvent */
export async function trackShopierCheckoutClick(touchpoint?: string): Promise<void> {
  await postMarketingEvent('begin_checkout', { touchpoint, checkout_provider: 'shopier' });
}
