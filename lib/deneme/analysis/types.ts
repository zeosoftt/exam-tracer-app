export type MasteryLevel = 'beginner' | 'learning' | 'intermediate' | 'mastered';

export type GapRiskLevel = 'normal' | 'risky' | 'critical';

export type KnowledgeProgressInput = {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEWED';
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  spacedRepetitionLevel: number;
  completedAt: Date | null;
  lastReviewedAt: Date | null;
};

export type DenemeTopicPerformanceInput = {
  topicId: string | null;
  topicName: string;
  subjectId: string | null;
  subjectName: string;
  questionCount: number;
  right: number;
  wrong: number;
  empty: number;
};

export type DenemeTopicAnalysisRow = {
  topicId: string | null;
  topicName: string;
  subjectName: string;
  knowledgeScore: number;
  knowledgeLevel: MasteryLevel;
  knowledgeLevelLabel: string;
  performanceScore: number | null;
  gap: number | null;
  gapRisk: GapRiskLevel | null;
  applicationRate: number | null;
  fakeMastery: boolean;
  fakeMasteryScore: number;
  impactScore: number;
  questionCount: number;
  examRight: number;
  recommendation: string;
};

export type DenemeAnalysisSummary = {
  topicsAnalyzed: number;
  topicsWithPerformance: number;
  avgKnowledge: number;
  avgPerformance: number;
  avgGap: number;
  avgApplicationRate: number;
  fakeMasteryCount: number;
  criticalGapCount: number;
  riskyGapCount: number;
  overallHealth: 'good' | 'mixed' | 'critical';
  analysisMode: 'topic' | 'subject';
};

export type DenemeTopicAnalysisResult = {
  summary: DenemeAnalysisSummary;
  topics: DenemeTopicAnalysisRow[];
  priorities: DenemeTopicAnalysisRow[];
  fakeMasteryTopics: DenemeTopicAnalysisRow[];
  strongTransferTopics: DenemeTopicAnalysisRow[];
};

export type DenemeTopicBreakdownItem = {
  topicId: string | null;
  topicName: string;
  subjectId: string | null;
  subjectName: string;
  questionCount: number;
  right: number;
  wrong: number;
  empty: number;
  successRate: number;
  matched: boolean;
};
