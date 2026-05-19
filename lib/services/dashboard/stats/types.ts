import type { PrismaClient } from '@prisma/client';
import { prisma as prismaTypeSource } from '@/lib/db/prisma';

export type PrismaWithExamAttempt = typeof prismaTypeSource;

export type DashboardStatsBuildInput = {
  userId: string;
  userRole: string | undefined;
  institutionId: string | null | undefined;
  isCoreScope: boolean;
};

export type UserGoals = {
  targetScore: number | null;
  dailyStudyHours: number | null;
} | null;

export type ActiveExamInfo = {
  id: string;
  name: string;
  code: string;
  startDate: Date | null;
} | null;

export type DenemeSummary = {
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

export type SpacedRepetitionStats = {
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
};

export type WeeklyStudyDay = {
  date: string;
  dayName: string;
  minutesStudied: number;
  goalMinutes: number;
  completed: boolean;
  hoursStudied: number;
  dayIndex: number;
};

export type TopicProgressCounts = {
  totalTopics: number;
  totalSubjects: number;
  completedTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  reviewedTopics: number;
};

export type DashboardStatsData = {
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
  activeExam: ActiveExamInfo;
  user: {
    targetScore: number | null;
    dailyStudyHours: number | null;
  };
  evaluation: Record<string, unknown> | null;
  study: {
    dailyStudyHoursGoal: number;
    weeklySummary: WeeklyStudyDay[];
  };
  deneme: DenemeSummary;
  spacedRepetition: SpacedRepetitionStats | null;
};

export type StatsDb = PrismaClient;
