/**
 * Dashboard istatistik orchestrator — parçalı sorgu servislerini birleştirir (SRP).
 */
import type { PrismaClient } from '@prisma/client';
import type { DashboardStatsBuildInput, PrismaWithExamAttempt } from '@/lib/services/dashboard/stats/types';
import { fetchUserGoals } from '@/lib/services/dashboard/stats/fetchUserGoals';
import { fetchExamOverview } from '@/lib/services/dashboard/stats/fetchExamOverview';
import { fetchPomodoroOverview } from '@/lib/services/dashboard/stats/fetchPomodoroOverview';
import { fetchDenemeSummary } from '@/lib/services/dashboard/stats/fetchDenemeSummary';
import { fetchTopicProgressCounts } from '@/lib/services/dashboard/stats/fetchTopicProgressCounts';
import { fetchSpacedRepetitionStats } from '@/lib/services/dashboard/stats/fetchSpacedRepetitionStats';
import { fetchWeeklyStudySummary } from '@/lib/services/dashboard/stats/fetchWeeklyStudySummary';
import { fetchEvaluationSummary } from '@/lib/services/dashboard/stats/fetchEvaluationSummary';

export async function buildDashboardStatsData(
  prisma: PrismaClient,
  input: DashboardStatsBuildInput,
): Promise<Record<string, unknown>> {
  const db = prisma as PrismaWithExamAttempt;
  const { userId, userRole, institutionId, isCoreScope } = input;

  const [user, examOverview, pomodoroOverview, denemeSummary] = await Promise.all([
    fetchUserGoals(prisma, userId),
    fetchExamOverview(prisma, userId, userRole, institutionId),
    fetchPomodoroOverview(prisma, userId),
    fetchDenemeSummary(db, userId, isCoreScope),
  ]);

  const { totalExams, activeExams, activeExamAssignment } = examOverview;
  const { totalStudyHours, totalPomodoroSessions } = pomodoroOverview;

  let topicProgress = {
    totalTopics: 0,
    totalSubjects: 0,
    completedTopics: 0,
    inProgressTopics: 0,
    notStartedTopics: 0,
    reviewedTopics: 0,
  };
  let spacedRepetition = null;

  const activeExamId = activeExamAssignment?.exam?.id;
  if (activeExamId) {
    const [progressCounts, spacedRepetitionStats] = await Promise.all([
      fetchTopicProgressCounts(prisma, userId, activeExamId),
      fetchSpacedRepetitionStats(prisma, userId, activeExamId, isCoreScope),
    ]);
    topicProgress = progressCounts;
    spacedRepetition = spacedRepetitionStats;
  }

  const weeklyStudySummary = await fetchWeeklyStudySummary(
    prisma,
    userId,
    user?.dailyStudyHours,
    isCoreScope,
  );

  let evaluationSummary = null;
  if (
    !isCoreScope &&
    user?.targetScore &&
    user.targetScore > 0 &&
    activeExamAssignment?.exam?.id
  ) {
    evaluationSummary = await fetchEvaluationSummary(
      prisma,
      userId,
      activeExamAssignment.exam.id,
      activeExamAssignment.exam.code,
      user.targetScore,
    );
  }

  return {
    totalExams,
    activeExams,
    completedTopics: topicProgress.completedTopics,
    inProgressTopics: topicProgress.inProgressTopics,
    notStartedTopics: topicProgress.notStartedTopics,
    reviewedTopics: topicProgress.reviewedTopics,
    totalTopics: topicProgress.totalTopics,
    totalSubjects: topicProgress.totalSubjects,
    totalStudyHours,
    totalPomodoroSessions,
    activeExam: activeExamAssignment?.exam || null,
    user: {
      targetScore: user?.targetScore || null,
      dailyStudyHours: user?.dailyStudyHours || null,
    },
    evaluation: evaluationSummary,
    study: {
      dailyStudyHoursGoal: user?.dailyStudyHours ?? 0,
      weeklySummary: weeklyStudySummary,
    },
    deneme: denemeSummary,
    spacedRepetition,
  };
}
