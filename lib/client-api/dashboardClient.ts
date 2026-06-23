/**
 * Dashboard HTTP — tek konum (DRY + KISS).
 */

import type { DashboardStats, PlanBadge } from '@/components/dashboard/domain/dashboardTypes';
import type { DetailData } from '@/components/dashboard/detail/dashboardDetailTypes';
import { fetchApiData } from '@/lib/client-api/http';
import { fetchJsonCached } from '@/lib/client-api/requestCache';

export type FetchStatsOptions = { manual?: boolean; force?: boolean; lite?: boolean };

export async function fetchDashboardStatsPayload(
  options?: FetchStatsOptions,
): Promise<DashboardStats | undefined> {
  const lite = options?.lite ?? true;
  const params = new URLSearchParams();
  params.set('scope', lite ? 'core' : 'full');
  if (options?.force || options?.manual) params.set('fresh', '1');
  const result = await fetchApiData<DashboardStats>(`/api/dashboard/stats?${params.toString()}`);
  return result.ok ? result.data : undefined;
}

export async function fetchBillingPlanBadge(): Promise<PlanBadge | null> {
  const { ok, body } = await fetchJsonCached<{ success?: boolean; data?: { planCode?: string } }>(
    '/api/billing/plan',
  );
  if (!ok || !body.success || !body.data?.planCode) return null;
  return planCodeToBadge(body.data.planCode);
}

export type FetchDetailOptions = { force?: boolean };

export async function fetchDashboardDetailData(
  options?: FetchDetailOptions,
): Promise<DetailData | null> {
  const url = options?.force ? '/api/dashboard/detail?fresh=1' : '/api/dashboard/detail';
  const result = await fetchApiData<DetailData>(url);
  return result.ok ? result.data : null;
}

/** Plan badge CSS eşlemesi — billing client ile paylaşılabilir */
export function planCodeToBadge(code: string): PlanBadge | null {
  if (code === 'FREE') {
    return {
      code,
      label: 'Free',
      bgClass: 'bg-stone-100 dark:bg-stone-800',
      textClass: 'text-stone-700 dark:text-stone-200',
      dotClass: 'bg-stone-400 dark:bg-stone-500',
    };
  }
  if (code === 'PRO') {
    return {
      code,
      label: 'Pro',
      bgClass: 'bg-accent-100 dark:bg-accent-950/50',
      textClass: 'text-accent-800 dark:text-accent-200',
      dotClass: 'bg-accent-500',
    };
  }
  if (code === 'ENTERPRISE') {
    return {
      code,
      label: 'Enterprise',
      bgClass: 'bg-violet-100 dark:bg-violet-950/50',
      textClass: 'text-violet-800 dark:text-violet-200',
      dotClass: 'bg-violet-500',
    };
  }
  return null;
}
