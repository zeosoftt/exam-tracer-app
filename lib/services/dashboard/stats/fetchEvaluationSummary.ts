import { getRequiredNet } from '@/config/targetScoreMaps';
import { evaluateTopics, getEvaluationSummary } from '@/lib/services/targetScoreEvaluation';
import type { StatsDb } from '@/lib/services/dashboard/stats/types';

type EvaluationSummary = Record<string, unknown>;

export async function fetchEvaluationSummary(
  db: StatsDb,
  userId: string,
  examId: string,
  examCode: string,
  targetScore: number,
): Promise<EvaluationSummary | null> {
  const totalExamQuestions = 120;

  const topicsWithProgress = await db.topic.findMany({
    where: {
      subject: {
        section: {
          examId,
          deletedAt: null,
        },
        deletedAt: null,
      },
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      order: true,
      subject: {
        select: {
          name: true,
          order: true,
          section: {
            select: {
              name: true,
              order: true,
            },
          },
        },
      },
      userProgress: {
        where: {
          userId,
          deletedAt: null,
        },
        select: {
          totalQuestions: true,
          correctAnswers: true,
          wrongAnswers: true,
        },
        take: 1,
      },
    },
    orderBy: [
      { subject: { section: { order: 'asc' } } },
      { subject: { order: 'asc' } },
      { order: 'asc' },
    ],
  });

  const topicsWithQuestions = topicsWithProgress.map((topic) => {
    const progress = topic.userProgress[0] || {
      totalQuestions: null,
      correctAnswers: null,
      wrongAnswers: null,
    };
    return {
      topicId: topic.id,
      topicName: topic.name,
      sectionName: topic.subject.section.name,
      subjectName: topic.subject.name,
      totalQuestions: progress.totalQuestions ?? 0,
      correctAnswers: progress.correctAnswers ?? 0,
      wrongAnswers: progress.wrongAnswers ?? 0,
    };
  });

  if (topicsWithQuestions.length === 0) {
    return null;
  }

  const topicsDataForEvaluation = topicsWithQuestions
    .filter((t) => t.totalQuestions > 0)
    .map((progress) => ({
      topicId: progress.topicId,
      topicName: progress.topicName,
      totalQuestions: progress.totalQuestions,
      correctAnswers: progress.correctAnswers,
      wrongAnswers: progress.wrongAnswers,
    }));

  const evaluations = evaluateTopics(topicsDataForEvaluation, {
    targetScore,
    totalExamQuestions,
    examCode,
  });

  const summary = getEvaluationSummary(evaluations);
  const requiredNet = getRequiredNet(targetScore, examCode);
  const requiredSuccessRate = requiredNet / totalExamQuestions;

  const evaluationByTopicId = new Map(evaluations.map((e) => [e.topicId, e]));
  const topicsWithStatus = topicsWithQuestions.map((t) => {
    const evalResult = evaluationByTopicId.get(t.topicId);
    return {
      ...t,
      status: evalResult?.status ?? null,
      topicSuccessRate: evalResult?.topicSuccessRate ?? null,
      topicNet: evalResult?.topicNet ?? null,
    };
  });

  return {
    totalTopics: summary.totalTopics,
    goodTopics: summary.goodTopics,
    improvableTopics: summary.improvableTopics,
    repeatTopics: summary.repeatTopics,
    averageSuccessRate: summary.averageSuccessRate,
    averageNet: summary.averageNet,
    targetScore,
    requiredNet,
    requiredSuccessRate,
    topics: topicsWithStatus,
  };
}
