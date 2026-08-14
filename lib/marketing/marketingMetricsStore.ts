/**
 * First-party pazarlama sayaçları — site_settings JSON (Super Admin funnel).
 */

import { getSetting, setSetting } from '@/lib/siteSettings';
import type { MarketingEventName } from '@/lib/marketing/marketingEventTypes';

export const MARKETING_METRICS_KEY = 'marketing_event_counts';
export const MARKETING_PURCHASES_TOTAL_KEY = 'marketing_purchases_total';

function parseCounts(raw: string): Record<string, number> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      const n = typeof v === 'number' ? v : parseInt(String(v), 10);
      if (Number.isFinite(n) && n >= 0) out[k] = n;
    }
    return out;
  } catch {
    return {};
  }
}

export async function getMarketingEventCounts(): Promise<Record<string, number>> {
  const raw = await getSetting(MARKETING_METRICS_KEY);
  return parseCounts(raw);
}

function counterKey(event: MarketingEventName, touchpoint?: string): string {
  return touchpoint ? `${event}:${touchpoint}` : event;
}

export async function incrementMarketingEvent(
  event: MarketingEventName,
  touchpoint?: string,
): Promise<void> {
  const raw = await getSetting(MARKETING_METRICS_KEY);
  const counts = parseCounts(raw);
  const specific = counterKey(event, touchpoint);
  counts[specific] = (counts[specific] ?? 0) + 1;
  counts[event] = (counts[event] ?? 0) + 1;
  await setSetting(MARKETING_METRICS_KEY, JSON.stringify(counts));

  if (event === 'begin_checkout') {
    const { incrementShopierCheckoutClick } = await import('@/lib/siteSettings');
    await incrementShopierCheckoutClick();
  }
}

export async function incrementPurchaseCount(): Promise<void> {
  const raw = await getSetting(MARKETING_PURCHASES_TOTAL_KEY);
  const n = parseInt(raw || '0', 10);
  const next = Number.isFinite(n) && n >= 0 ? n + 1 : 1;
  await setSetting(MARKETING_PURCHASES_TOTAL_KEY, String(next));
  await incrementMarketingEvent('purchase', 'shopier_webhook');
}

export async function getPurchaseCount(): Promise<number> {
  const raw = await getSetting(MARKETING_PURCHASES_TOTAL_KEY);
  const n = parseInt(raw || '0', 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Touchpoint bazlı begin_checkout sayıları */
export function extractCheckoutByTouchpoint(counts: Record<string, number>): Array<{ touchpoint: string; count: number }> {
  const prefix = 'begin_checkout:';
  return Object.entries(counts)
    .filter(([k]) => k.startsWith(prefix))
    .map(([k, count]) => ({ touchpoint: k.slice(prefix.length), count }))
    .sort((a, b) => b.count - a.count);
}
