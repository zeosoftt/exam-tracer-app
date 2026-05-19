'use client';

import { useCallback } from 'react';
import { useDashboardStats } from '@/components/dashboard/hooks/useDashboardStats';
import { usePlanBadge } from '@/components/dashboard/hooks/usePlanBadge';
import { useEvaluationTopicEditor } from '@/components/dashboard/hooks/useEvaluationTopicEditor';
import { useDashboardViewModel } from '@/components/dashboard/hooks/useDashboardViewModel';
import type { DashboardUser } from '@/components/dashboard/home/dashboardHomeTypes';

export function useDashboardPage(user: DashboardUser) {
  const { stats, isLoading, statsRefreshing, statsUpdatedAt, fetchStats } = useDashboardStats();
  const planBadge = usePlanBadge();
  const evaluationEditor = useEvaluationTopicEditor(fetchStats);
  const vm = useDashboardViewModel(stats, evaluationEditor.evaluationFilter, user.name);

  const srsOverdue = stats?.spacedRepetition?.summary.overdue ?? 0;
  const srsDueWeek = stats?.spacedRepetition?.summary.dueWithinWeek ?? 0;

  const refreshDashboard = useCallback(async () => {
    await fetchStats({ manual: true, force: true, lite: true });
    void fetchStats({ force: true, lite: false });
  }, [fetchStats]);

  return {
    user,
    stats,
    isLoading,
    statsRefreshing,
    statsUpdatedAt,
    planBadge,
    vm,
    srsOverdue,
    srsDueWeek,
    refreshDashboard,
    ...evaluationEditor,
  };
}

export type DashboardPageState = ReturnType<typeof useDashboardPage>;
