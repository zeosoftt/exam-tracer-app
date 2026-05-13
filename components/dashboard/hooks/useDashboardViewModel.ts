'use client';

import { useMemo } from 'react';
import type { DashboardStats, EvaluationFilter } from '../domain/dashboardTypes';
import {
  buildDenemeSparkline,
  buildWeeklyStudyByLabel,
  computeCompletionRate,
  computeExamCountdown,
  computeTotalTopics,
  filterEvaluationTopics,
  formatDashboardTodayLabel,
  getFirstName,
  groupEvaluationTopicsBySectionSubject,
} from '../domain/dashboardSelectors';

export function useDashboardViewModel(
  stats: DashboardStats | null,
  evaluationFilter: EvaluationFilter,
  userFullName: string,
) {
  return useMemo(() => {
    const totalTopics = computeTotalTopics(stats);
    const evaluationTopics = stats?.evaluation?.topics ?? [];
    const filteredEvaluationTopics = filterEvaluationTopics(evaluationTopics, evaluationFilter);
    return {
      totalTopics,
      completionRate: computeCompletionRate(stats, totalTopics),
      studyHours: stats?.totalStudyHours || 0,
      weeklyStudyByLabel: buildWeeklyStudyByLabel(stats?.study?.weeklySummary),
      denemeSparkline: buildDenemeSparkline(stats?.deneme?.recentAttempts),
      examCountdown: computeExamCountdown(stats?.activeExam?.startDate ?? null),
      evaluationTopics,
      filteredEvaluationTopics,
      groupedTopics: groupEvaluationTopicsBySectionSubject(filteredEvaluationTopics),
      todayLabel: formatDashboardTodayLabel(),
      firstName: getFirstName(userFullName),
    };
  }, [stats, evaluationFilter, userFullName]);
}
