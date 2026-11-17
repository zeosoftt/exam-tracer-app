'use client';

import { useDashboardStats } from '@/components/dashboard/hooks/useDashboardStats';
import { usePlanBadge } from '@/components/dashboard/hooks/usePlanBadge';
import { useDashboardViewModel } from '@/components/dashboard/hooks/useDashboardViewModel';
import type { DashboardUser } from '@/components/dashboard/home/dashboardHomeTypes';
import type { DashboardHomeInitialData } from '@/components/dashboard/domain/dashboardTypes';

export function useDashboardPage(user: DashboardUser, initialData?: DashboardHomeInitialData) {
  const {
    stats,
    isLoading,
    loadError,
    statsUpdatedAt,
    fetchStats,
    reviewAckTopicId,
    acknowledgeTopicReview,
  } = useDashboardStats(initialData?.stats ?? null);
  const planBadge = usePlanBadge(initialData?.planCode ?? null);
  const vm = useDashboardViewModel(stats, user.name);

  const srsOverdue = stats?.spacedRepetition?.summary.overdue ?? 0;

  return {
    user,
    stats,
    isLoading,
    loadError,
    statsUpdatedAt,
    fetchStats,
    planBadge,
    vm,
    srsOverdue,
    reviewAckTopicId,
    acknowledgeTopicReview,
  };
}

export type DashboardPageState = ReturnType<typeof useDashboardPage>;
