'use client';

import { useDashboardStats } from '@/components/dashboard/hooks/useDashboardStats';
import { usePlanBadge } from '@/components/dashboard/hooks/usePlanBadge';
import { useDashboardViewModel } from '@/components/dashboard/hooks/useDashboardViewModel';
import type { DashboardUser } from '@/components/dashboard/home/dashboardHomeTypes';

export function useDashboardPage(user: DashboardUser) {
  const {
    stats,
    isLoading,
    loadError,
    statsUpdatedAt,
    fetchStats,
    reviewAckTopicId,
    acknowledgeTopicReview,
  } = useDashboardStats();
  const planBadge = usePlanBadge();
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
