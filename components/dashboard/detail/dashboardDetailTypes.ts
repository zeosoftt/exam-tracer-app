/**
 * Konu detay ekranı domain tipleri
 */

export interface TopicEvaluation {
  topicNet: number;
  topicSuccessRate: number;
  requiredSuccessRate: number;
  requiredNet: number;
  status: 'GOOD' | 'IMPROVABLE' | 'REPEAT';
  isGood: boolean;
  isImprovable: boolean;
  needsRepeat: boolean;
}

export interface Topic {
  id: string;
  code: string;
  name: string;
  order: number;
  examQuestionCount: number | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  evaluation: TopicEvaluation | null;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  order: number;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  reviewedTopics: number;
  progressPercentage: number;
  topics: Topic[];
}

export interface Section {
  id: string;
  code: string;
  name: string;
  order: number;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  reviewedTopics: number;
  progressPercentage: number;
  subjects: Subject[];
}

export interface DetailData {
  exam: {
    id: string;
    name: string;
    code: string;
  } | null;
  sections: Section[];
  evaluation: {
    targetScore: number;
    totalExamQuestions: number;
    requiredNet: number | null;
    requiredSuccessRate: number | null;
  } | null;
}
