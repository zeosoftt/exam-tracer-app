import type { ProgressStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { computeDenemeTopicAnalysis } from '@/lib/deneme/analysis/computeDenemeTopicAnalysis';
import type { AnalysisTopicInput } from '@/lib/deneme/analysis/computeDenemeTopicAnalysis';
import type {
  DenemeTopicAnalysisResult,
  DenemeTopicBreakdownItem,
  KnowledgeProgressInput,
} from '@/lib/deneme/analysis/types';
import { findUserDenemeAttemptById } from '@/lib/deneme/denemeRepository';

type SubjectBreakdownRow = {
  subjectId: string;
  subjectName: string;
  right: number;
  wrong: number;
  empty: number;
};

function parseTopicBreakdown(raw: unknown): DenemeTopicBreakdownItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item) => item && typeof item === 'object') as DenemeTopicBreakdownItem[];
}

function parseSubjectBreakdown(raw: unknown): SubjectBreakdownRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item === 'object' && 'subjectId' in item)
    .map((item) => item as SubjectBreakdownRow);
}

export async function buildDenemeAnalysisForAttempt(
  userId: string,
  attemptId: string,
): Promise<DenemeTopicAnalysisResult | null> {
  const attempt = await findUserDenemeAttemptById(userId, attemptId);
  if (!attempt) return null;

  const topicBreakdown = parseTopicBreakdown(attempt.topicBreakdown);
  const subjectBreakdown = parseSubjectBreakdown(attempt.breakdown);

  const examTopics = await prisma.topic.findMany({
    where: {
      deletedAt: null,
      subject: {
        deletedAt: null,
        section: { examId: attempt.examId, deletedAt: null },
      },
    },
    select: {
      id: true,
      name: true,
      subject: { select: { id: true, name: true } },
    },
  });

  const progressRows = await prisma.userProgress.findMany({
    where: {
      userId,
      deletedAt: null,
      topicId: { in: examTopics.map((topic) => topic.id) },
    },
    select: {
      topicId: true,
      status: true,
      totalQuestions: true,
      correctAnswers: true,
      wrongAnswers: true,
      spacedRepetitionLevel: true,
      completedAt: true,
      lastReviewedAt: true,
    },
  });

  const progressByTopic = new Map(progressRows.map((row) => [row.topicId, row]));

  const defaultKnowledge = (topicId: string | null): KnowledgeProgressInput => {
    if (!topicId) {
      return {
        status: 'NOT_STARTED',
        totalQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        spacedRepetitionLevel: 0,
        completedAt: null,
        lastReviewedAt: null,
      };
    }
    const progress = progressByTopic.get(topicId);
    return {
      status: (progress?.status ?? 'NOT_STARTED') as ProgressStatus,
      totalQuestions: progress?.totalQuestions ?? 0,
      correctAnswers: progress?.correctAnswers ?? 0,
      wrongAnswers: progress?.wrongAnswers ?? 0,
      spacedRepetitionLevel: progress?.spacedRepetitionLevel ?? 0,
      completedAt: progress?.completedAt ?? null,
      lastReviewedAt: progress?.lastReviewedAt ?? null,
    };
  };

  if (topicBreakdown.length > 0) {
    const inputs: AnalysisTopicInput[] = topicBreakdown
      .filter((row) => row.questionCount > 0)
      .map((row) => ({
        topicId: row.topicId,
        topicName: row.topicName,
        subjectName: row.subjectName,
        knowledge: defaultKnowledge(row.topicId),
        performance: {
          topicId: row.topicId,
          topicName: row.topicName,
          subjectId: row.subjectId,
          subjectName: row.subjectName,
          questionCount: row.questionCount,
          right: row.right,
          wrong: row.wrong,
          empty: row.empty,
        },
      }));

    return computeDenemeTopicAnalysis(inputs, 'topic');
  }

  if (subjectBreakdown.length === 0) return null;

  const topicsBySubject = new Map<string, typeof examTopics>();
  for (const topic of examTopics) {
    const list = topicsBySubject.get(topic.subject.id) ?? [];
    list.push(topic);
    topicsBySubject.set(topic.subject.id, list);
  }

  const inputs: AnalysisTopicInput[] = [];

  for (const subjectRow of subjectBreakdown) {
    const subjectTopics = topicsBySubject.get(subjectRow.subjectId) ?? [];
    const totalAsked = subjectRow.right + subjectRow.wrong + subjectRow.empty;
    if (totalAsked <= 0 || subjectTopics.length === 0) continue;

    for (const topic of subjectTopics) {
      inputs.push({
        topicId: topic.id,
        topicName: topic.name,
        subjectName: topic.subject.name,
        knowledge: defaultKnowledge(topic.id),
        performance: {
          topicId: topic.id,
          topicName: topic.name,
          subjectId: topic.subject.id,
          subjectName: topic.subject.name,
          questionCount: Math.max(1, Math.round(totalAsked / subjectTopics.length)),
          right: Math.round(subjectRow.right / subjectTopics.length),
          wrong: Math.round(subjectRow.wrong / subjectTopics.length),
          empty: Math.round(subjectRow.empty / subjectTopics.length),
        },
      });
    }
  }

  if (inputs.length === 0) return null;
  return computeDenemeTopicAnalysis(inputs, 'subject');
}
