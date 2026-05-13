/**
 * Saf dashboard türetilmiş durumu — React’tan bağımsız (SRP, kolay test).
 */

import type {
  DashboardStats,
  DashboardEvaluationTopic,
  EvaluationFilter,
  GroupedEvaluationSection,
  StudyDay,
} from './dashboardTypes';

export function computeTotalTopics(stats: DashboardStats | null): number {
  if (!stats) return 0;
  return (
    stats.totalTopics ||
    (stats.completedTopics || 0) + (stats.inProgressTopics || 0) + (stats.notStartedTopics || 0)
  );
}

export function computeCompletionRate(stats: DashboardStats | null, totalTopics: number): number {
  if (totalTopics <= 0) return 0;
  return Math.round(((stats?.completedTopics || 0) / totalTopics) * 100);
}

export function buildWeeklyStudyByLabel(weeklySummary: StudyDay[] | undefined): Map<string, StudyDay> | null {
  if (!weeklySummary?.length) return null;
  return new Map(weeklySummary.map((d) => [d.dayName, d]));
}

export type DenemeSparkline = {
  slice: Array<{ attemptedAt: string; totalScore: number | null; netScore: number | null }>;
  minNet: number;
  maxNet: number;
  range: number;
};

export function buildDenemeSparkline(
  recentAttempts: NonNullable<DashboardStats['deneme']>['recentAttempts'] | undefined,
): DenemeSparkline | null {
  if (!recentAttempts?.length) return null;
  const slice = [...recentAttempts].reverse().slice(0, 8);
  const nets = slice.map((a) => a.netScore ?? 0);
  const minNet = Math.min(...nets);
  const maxNet = Math.max(...nets);
  const range = maxNet - minNet || 1;
  return { slice, minNet, maxNet, range };
}

export type ExamCountdown =
  | { kind: 'nodate' }
  | { kind: 'future'; daysLeft: number }
  | { kind: 'today' }
  | { kind: 'past' };

export function computeExamCountdown(startDate: string | null | undefined): ExamCountdown {
  if (!startDate) return { kind: 'nodate' };
  const examDate = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);
  const diffMs = examDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (daysLeft > 0) return { kind: 'future', daysLeft };
  if (daysLeft === 0) return { kind: 'today' };
  return { kind: 'past' };
}

export function filterEvaluationTopics(
  topics: DashboardEvaluationTopic[],
  filter: EvaluationFilter,
): DashboardEvaluationTopic[] {
  if (!filter) return topics;
  return topics.filter((t) => t.status === filter);
}

export function groupEvaluationTopicsBySectionSubject(
  filteredTopics: DashboardEvaluationTopic[],
): Record<string, GroupedEvaluationSection> {
  if (filteredTopics.length === 0) {
    return {};
  }
  return filteredTopics.reduce<Record<string, GroupedEvaluationSection>>((acc, topic) => {
    const key = `${topic.sectionName}|${topic.subjectName}`;
    if (!acc[key]) {
      acc[key] = {
        sectionName: topic.sectionName,
        subjectName: topic.subjectName,
        topics: [],
      };
    }
    acc[key].topics.push(topic);
    return acc;
  }, {});
}

export function formatDashboardTodayLabel(): string {
  return new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function getFirstName(fullName: string): string {
  return fullName.split(' ')[0] ?? fullName;
}
