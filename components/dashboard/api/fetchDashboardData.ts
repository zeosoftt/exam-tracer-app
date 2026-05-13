/**
 * Dashboard HTTP erişimi — bileşen/hook içinde ham fetch dağılımını keser (SRP, DIP).
 */

import type { DashboardStats, PlanBadge } from '../domain/dashboardTypes';

export type FetchStatsOptions = { manual?: boolean; force?: boolean; lite?: boolean };

export async function fetchDashboardStatsPayload(options?: FetchStatsOptions): Promise<DashboardStats | undefined> {
  const lite = options?.lite ?? true;
  const params = new URLSearchParams();
  params.set('scope', lite ? 'core' : 'full');
  if (options?.force || options?.manual) params.set('fresh', '1');
  const url = `/api/dashboard/stats?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) return undefined;
  const data = (await response.json()) as { data?: DashboardStats };
  return data.data;
}

export async function fetchBillingPlanBadge(): Promise<PlanBadge | null> {
  const res = await fetch('/api/billing/plan');
  if (!res.ok) return null;
  const json = (await res.json()) as { success?: boolean; data?: { planCode?: string } };
  if (!json.success || !json.data) return null;
  const code: string = json.data.planCode ?? '';

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
