/**
 * GTM / GA4 dönüşüm olayları — SiteTracking yüklüyse dataLayer + gtag kullanılır.
 */

export type ConversionEventName =
  | 'begin_checkout'
  | 'sign_up'
  | 'onboarding_complete'
  | 'setup_wizard_complete';

export type ConversionEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackConversion(event: ConversionEventName, params?: ConversionEventParams): void {
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
