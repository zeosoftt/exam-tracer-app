import type { EvaluationFilter } from '@/components/dashboard/domain/dashboardTypes';
import type { Topic } from '@/components/dashboard/detail/dashboardDetailTypes';

export type DetailEvaluationCounts = {
  good: number;
  improvable: number;
  repeat: number;
};

export function countDetailTopicEvaluation(topics: Topic[]): DetailEvaluationCounts {
  return topics.reduce<DetailEvaluationCounts>(
    (acc, topic) => {
      if (!topic.evaluation) return acc;
      if (topic.evaluation.isGood) acc.good += 1;
      else if (topic.evaluation.isImprovable) acc.improvable += 1;
      else acc.repeat += 1;
      return acc;
    },
    { good: 0, improvable: 0, repeat: 0 },
  );
}

export function filterDetailTopicsByEvaluation(topics: Topic[], filter: EvaluationFilter): Topic[] {
  if (!filter) return topics;
  return topics.filter((topic) => topic.evaluation?.status === filter);
}

export function computeDetailTopicAverages(topics: Topic[]) {
  const evaluated = topics.filter((topic) => topic.evaluation);
  if (evaluated.length === 0) return null;

  const averageSuccessRate =
    evaluated.reduce((sum, topic) => sum + topic.evaluation!.topicSuccessRate, 0) / evaluated.length;
  const averageNet = evaluated.reduce((sum, topic) => sum + topic.evaluation!.topicNet, 0) / evaluated.length;

  return { averageSuccessRate, averageNet };
}
