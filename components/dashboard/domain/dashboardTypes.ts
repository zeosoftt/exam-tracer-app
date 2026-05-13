/**
 * Dashboard domain types — tek kaynak (ISP: bileşenler geniş arayüze bağlanmaz).
 */

export interface StudyDay {
  date: string;
  dayName: string;
  minutesStudied: number;
  goalMinutes: number;
  completed: boolean;
  hoursStudied: number;
}

export interface DashboardStats {
  totalExams: number;
  activeExams: number;
  completedTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  reviewedTopics: number;
  totalTopics: number;
  totalSubjects: number;
  totalStudyHours: number;
  totalPomodoroSessions: number;
  activeExam: {
    id: string;
    name: string;
    code: string;
    startDate: string | null;
  } | null;
  user?: {
    targetScore: number | null;
    dailyStudyHours: number | null;
  };
  study?: {
    dailyStudyHoursGoal: number;
    weeklySummary: StudyDay[];
  };
  deneme?: {
    totalAttempts: number;
    lastAttemptAt: string | null;
    lastAttemptScore: number | null;
    lastAttemptNet: number | null;
    lastAttemptExamName: string | null;
    recentAttempts: Array<{
      attemptedAt: string;
      totalScore: number | null;
      netScore: number | null;
    }>;
  };
  spacedRepetition?: {
    summary: { overdue: number; dueWithinWeek: number; totalScheduled: number };
    scheduleExplanation: string;
    items: Array<{
      topicId: string;
      topicName: string;
      subjectName: string;
      sectionName: string;
      nextReviewAt: string;
      overdue: boolean;
      daysUntil: number;
      level: number;
    }>;
  } | null;
  evaluation?: {
    totalTopics: number;
    goodTopics: number;
    improvableTopics: number;
    repeatTopics: number;
    averageSuccessRate: number;
    averageNet: number;
    targetScore: number;
    requiredNet: number;
    requiredSuccessRate: number;
    topics?: Array<{
      topicId: string;
      topicName: string;
      sectionName: string;
      subjectName: string;
      totalQuestions: number;
      correctAnswers: number;
      wrongAnswers: number;
      status?: string | null;
      topicSuccessRate?: number | null;
      topicNet?: number | null;
    }>;
  } | null;
}

export type EvaluationFilter = 'GOOD' | 'IMPROVABLE' | 'REPEAT' | null;

export type PlanBadge = {
  code: string;
  label: string;
  bgClass: string;
  textClass: string;
  dotClass: string;
};

export type DashboardEvaluationTopic = NonNullable<NonNullable<DashboardStats['evaluation']>['topics']>[number];

export type TopicEditValues = {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
};

export type GroupedEvaluationSection = {
  sectionName: string;
  subjectName: string;
  topics: Array<{
    topicId: string;
    topicName: string;
    sectionName: string;
    subjectName: string;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    status?: string | null;
  }>;
};
