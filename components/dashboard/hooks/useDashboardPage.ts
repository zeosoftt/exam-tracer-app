'use client';

import { useDashboardStats } from '@/components/dashboard/hooks/useDashboardStats';
import { usePlanBadge } from '@/components/dashboard/hooks/usePlanBadge';
import { useEvaluationTopicEditor } from '@/components/dashboard/hooks/useEvaluationTopicEditor';
import { useDashboardViewModel } from '@/components/dashboard/hooks/useDashboardViewModel';
import type { DashboardUser } from '@/components/dashboard/home/dashboardHomeTypes';

export function useDashboardPage(user: DashboardUser) {
  const { stats, isLoading, statsUpdatedAt, fetchStats } = useDashboardStats();
  const planBadge = usePlanBadge();
  const { reviewAckTopicId, acknowledgeTopicReview } = useEvaluationTopicEditor(fetchStats);
  const vm = useDashboardViewModel(stats, user.name);

  const srsOverdue = stats?.spacedRepetition?.summary.overdue ?? 0;
  const srsDueWeek = stats?.spacedRepetition?.summary.dueWithinWeek ?? 0;

  return {
    user,
    stats,
    isLoading,
    statsUpdatedAt,
    planBadge,
    vm,
    srsOverdue,
    srsDueWeek,
    reviewAckTopicId,
    acknowledgeTopicReview,
  };
}

export type DashboardPageState = ReturnType<typeof useDashboardPage>;
