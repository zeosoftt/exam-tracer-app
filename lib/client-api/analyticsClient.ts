/**
 * Lightweight client analytics (e.g. checkout link clicks).
 */

export async function trackShopierCheckoutClick(): Promise<void> {
  try {
    await fetch('/api/analytics/shopier-checkout-click', {
      method: 'POST',
      keepalive: true,
    });
  } catch {
    // non-blocking
  }
}
