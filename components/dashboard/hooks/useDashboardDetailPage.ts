'use client';

import { useDashboardDetailData } from '@/components/dashboard/hooks/useDashboardDetailData';
import { useDashboardDetailTopicActions } from '@/components/dashboard/hooks/useDashboardDetailTopicActions';

export function useDashboardDetailPage() {
  const detailData = useDashboardDetailData();
  const topicActions = useDashboardDetailTopicActions(detailData.fetchDetailData);

  return {
    ...detailData,
    ...topicActions,
  };
}

export type DashboardDetailPageState = ReturnType<typeof useDashboardDetailPage>;
