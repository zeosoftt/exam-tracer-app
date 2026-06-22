import {
  computeApplicationRate,
  computeFakeMasteryScore,
  computeImpactScore,
  computeKnowledgeGap,
  buildTopicRecommendation,
  getGapRiskLevel,
} from '@/lib/deneme/analysis/metrics';
import {
  computeKnowledgeScore,
  computePerformanceScore,
  getMasteryLevel,
  getMasteryLevelLabel,
} from '@/lib/deneme/analysis/knowledgeScore';
import type {
  DenemeTopicAnalysisResult,
  DenemeTopicAnalysisRow,
  DenemeTopicPerformanceInput,
  KnowledgeProgressInput,
} from '@/lib/deneme/analysis/types';

export type AnalysisTopicInput = {
  topicId: string | null;
  topicName: string;
  subjectName: string;
  knowledge: KnowledgeProgressInput;
  performance: DenemeTopicPerformanceInput | null;
};

function analyzeRow(
  input: AnalysisTopicInput,
  totalQuestionsAsked: number,
): DenemeTopicAnalysisRow | null {
  if (!input.performance || input.performance.questionCount <= 0) {
    return null;
  }

  const knowledgeScore = computeKnowledgeScore(input.knowledge);
  const knowledgeLevel = getMasteryLevel(knowledgeScore);
  const performanceScore = computePerformanceScore(
    input.performance.right,
    input.performance.questionCount,
  );

  if (performanceScore == null) return null;

  const gap = computeKnowledgeGap(knowledgeScore, performanceScore);
  const gapRisk = getGapRiskLevel(gap);
  const applicationRate = computeApplicationRate(knowledgeScore, performanceScore);
  const { fakeMastery, score: fakeMasteryScore } = computeFakeMasteryScore(
    knowledgeScore,
    performanceScore,
  );
  const impactScore = computeImpactScore(gap, input.performance.questionCount, totalQuestionsAsked);

  return {
    topicId: input.topicId,
    topicName: input.topicName,
    subjectName: input.subjectName,
    knowledgeScore,
    knowledgeLevel,
    knowledgeLevelLabel: getMasteryLevelLabel(knowledgeLevel),
    performanceScore,
    gap,
    gapRisk,
    applicationRate,
    fakeMastery,
    fakeMasteryScore,
    impactScore,
    questionCount: input.performance.questionCount,
    examRight: input.performance.right,
    recommendation: buildTopicRecommendation({
      fakeMastery,
      gapRisk,
      gap,
      knowledgeScore,
      performanceScore,
      applicationRate,
    }),
  };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function deriveOverallHealth(rows: DenemeTopicAnalysisRow[]): 'good' | 'mixed' | 'critical' {
  if (rows.some((row) => row.gapRisk === 'critical' || row.fakeMastery)) return 'critical';
  if (rows.some((row) => row.gapRisk === 'risky')) return 'mixed';
  return 'good';
}

export function computeDenemeTopicAnalysis(
  topics: AnalysisTopicInput[],
  mode: 'topic' | 'subject' = 'topic',
): DenemeTopicAnalysisResult {
  const totalQuestionsAsked = topics.reduce(
    (sum, topic) => sum + (topic.performance?.questionCount ?? 0),
    0,
  );

  const rows = topics
    .map((topic) => analyzeRow(topic, totalQuestionsAsked))
    .filter((row): row is DenemeTopicAnalysisRow => row != null);

  const priorities = [...rows]
    .filter((row) => row.impactScore > 0)
    .sort((a, b) => b.impactScore - a.impactScore);
  const fakeMasteryTopics = rows.filter((row) => row.fakeMastery).sort((a, b) => b.impactScore - a.impactScore);
  const strongTransferTopics = rows
    .filter((row) => {
      if (row.gap != null && row.gap < 0 && (row.performanceScore ?? 0) >= 60) return true;
      return (row.applicationRate ?? 0) >= 85 && row.gapRisk === 'normal' && (row.gap ?? 0) >= 0;
    })
    .sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0));

  const gaps = rows.map((row) => row.gap ?? 0);
  const performances = rows.map((row) => row.performanceScore ?? 0);
  const knowledges = rows.map((row) => row.knowledgeScore);
  const applications = rows.map((row) => row.applicationRate ?? 0);

  return {
    summary: {
      topicsAnalyzed: topics.length,
      topicsWithPerformance: rows.length,
      avgKnowledge: average(knowledges),
      avgPerformance: average(performances),
      avgGap: average(gaps),
      avgApplicationRate: average(applications),
      fakeMasteryCount: fakeMasteryTopics.length,
      criticalGapCount: rows.filter((row) => row.gapRisk === 'critical').length,
      riskyGapCount: rows.filter((row) => row.gapRisk === 'risky').length,
      overallHealth: deriveOverallHealth(rows),
      analysisMode: mode,
    },
    topics: rows.sort((a, b) => b.impactScore - a.impactScore),
    priorities: priorities.slice(0, 8),
    fakeMasteryTopics,
    strongTransferTopics: strongTransferTopics.slice(0, 5),
  };
}
