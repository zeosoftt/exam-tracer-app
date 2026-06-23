'use client';

import { useState, useEffect } from 'react';
import type { EvaluationFilter } from '@/components/dashboard/domain/dashboardTypes';
import { useDashboardDetailData } from '@/components/dashboard/hooks/useDashboardDetailData';
import { useDashboardDetailTopicActions } from '@/components/dashboard/hooks/useDashboardDetailTopicActions';

export function useDashboardDetailPage() {
  const detailData = useDashboardDetailData();
  const topicActions = useDashboardDetailTopicActions(detailData.fetchDetailData);
  const [evaluationFilter, setEvaluationFilter] = useState<EvaluationFilter>(null);

  useEffect(() => {
    setEvaluationFilter(null);
  }, [detailData.selectedSubjectId]);

  return {
    ...detailData,
    ...topicActions,
    evaluationFilter,
    setEvaluationFilter,
  };
}

export type DashboardDetailPageState = ReturnType<typeof useDashboardDetailPage>;
