'use client';

import { useMemo } from 'react';
import type { DashboardStats } from '../domain/dashboardTypes';
import {
  buildDenemeSparkline,
  buildWeeklyStudyByLabel,
  computeCompletionRate,
  computeExamCountdown,
  computeTotalTopics,
  formatDashboardTodayLabel,
  getFirstName,
} from '../domain/dashboardSelectors';

export function useDashboardViewModel(
  stats: DashboardStats | null,
  userFullName: string,
) {
  return useMemo(() => {
    const totalTopics = computeTotalTopics(stats);
    return {
      totalTopics,
      completionRate: computeCompletionRate(stats, totalTopics),
      studyHours: stats?.totalStudyHours || 0,
      weeklyStudyByLabel: buildWeeklyStudyByLabel(stats?.study?.weeklySummary),
      denemeSparkline: buildDenemeSparkline(stats?.deneme?.recentAttempts),
      examCountdown: computeExamCountdown(stats?.activeExam?.startDate ?? null),
      todayLabel: formatDashboardTodayLabel(),
      firstName: getFirstName(userFullName),
    };
  }, [stats, userFullName]);
}
