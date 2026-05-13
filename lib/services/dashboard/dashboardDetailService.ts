/**
 * Konu detay API verisi — HTTP/cache route disinda (SRP).
 */

import type { PrismaClient } from '@prisma/client';
import { evaluateTopics, calculateRequiredSuccessRate } from '@/lib/services/targetScoreEvaluation';
import { getRequiredNet } from '@/config/targetScoreMaps';

export type DashboardDetailData = {
  exam: unknown;
  sections: unknown[];
  evaluation: unknown;
};

export type BuildDashboardDetailResult =
  | { user: null; detail: null }
  | { user: { id: string }; detail: DashboardDetailData };

/**
 * Aktif sınav yoksa `exam: null`, `sections: []` döner.
 * Kullanıcı yoksa `{ user: null, detail: null }`.
 */
export async function buildDashboardDetailData(
  prisma: PrismaClient,
  userId: string,
): Promise<BuildDashboardDetailResult> {
  const [user, activeExamAssignment] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, targetScore: true },
    }),
    prisma.examAssignment.findFirst({
      where: {
        userId,
        deletedAt: null,
        exam: { status: 'ACTIVE', deletedAt: null },
      },
      include: {
        exam: { select: { id: true, name: true, code: true } },
      },
      orderBy: { assignedAt: 'desc' },
    }),
  ]);

  if (!user) {
    return { user: null, detail: null };
  }

  if (!activeExamAssignment?.exam?.id) {
    return {
      user: { id: user.id },
      detail: { exam: null, sections: [], evaluation: null },
    };
  }

  const examId = activeExamAssignment.exam.id;
  const examCode = activeExamAssignment.exam.code;
  const targetScore = user.targetScore ?? 0;

  const [sections, userProgress] = await Promise.all([
    prisma.section.findMany({
      where: { examId, deletedAt: null },
      include: {
        subjects: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
          include: {
            topics: {
              where: { deletedAt: null },
              orderBy: { order: 'asc' },
              select: {
                id: true,
                code: true,
                name: true,
                order: true,
                examQuestionCount: true,
              },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    }),
    prisma.userProgress.findMany({
      where: {
        userId,
        topic: {
          subject: {
            section: { examId, deletedAt: null },
            deletedAt: null,
          },
          deletedAt: null,
        },
        deletedAt: null,
      },
      select: {
        topicId: true,
        status: true,
        totalQuestions: true,
        correctAnswers: true,
        wrongAnswers: true,
      },
    }),
  ]);

  const progressMap = new Map(userProgress.map((progress) => [progress.topicId, progress.status]));
  const questionStatsMap = new Map(
    userProgress.map((progress) => [
      progress.topicId,
      {
        totalQuestions: progress.totalQuestions ?? 0,
        correctAnswers: progress.correctAnswers ?? 0,
        wrongAnswers: progress.wrongAnswers ?? 0,
      },
    ]),
  );

  const totalExamQuestions = 120;

  const evaluationConfig =
    targetScore > 0
      ? {
          targetScore,
          totalExamQuestions,
          examCode,
        }
      : null;

  const evaluationMap = new Map<
    string,
    {
      topicNet: number;
      topicSuccessRate: number;
      requiredSuccessRate: number;
      requiredNet: number;
      status: string;
      isGood: boolean;
      isImprovable: boolean;
      needsRepeat: boolean;
    }
  >();
  let requiredNet: number | null = null;
  let requiredSuccessRate: number | null = null;

  if (evaluationConfig) {
    const topicsForEvaluation: Array<{
      topicId: string;
      topicName: string;
      totalQuestions: number;
      correctAnswers: number;
      wrongAnswers: number;
    }> = [];

    for (const section of sections) {
      for (const subject of section.subjects) {
        for (const topic of subject.topics) {
          const questionStats = questionStatsMap.get(topic.id) || {
            totalQuestions: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
          };

          if (questionStats.totalQuestions > 0) {
            topicsForEvaluation.push({
              topicId: topic.id,
              topicName: topic.name,
              totalQuestions: questionStats.totalQuestions,
              correctAnswers: questionStats.correctAnswers,
              wrongAnswers: questionStats.wrongAnswers,
            });
          }
        }
      }
    }

    if (topicsForEvaluation.length > 0) {
      const evaluations = evaluateTopics(topicsForEvaluation, evaluationConfig);

      requiredNet = getRequiredNet(evaluationConfig.targetScore, examCode);
      requiredSuccessRate = calculateRequiredSuccessRate(evaluationConfig);

      for (const evalResult of evaluations) {
        evaluationMap.set(evalResult.topicId, {
          topicNet: evalResult.topicNet,
          topicSuccessRate: evalResult.topicSuccessRate,
          requiredSuccessRate: evalResult.requiredSuccessRate,
          requiredNet: evalResult.requiredNet,
          status: evalResult.status,
          isGood: evalResult.isGood,
          isImprovable: evalResult.isImprovable,
          needsRepeat: evalResult.needsRepeat,
        });
      }
    }
  }

  const sectionsWithProgress = sections.map((section) => {
    const sectionTopics: string[] = [];
    const sectionCompleted: string[] = [];
    const sectionInProgress: string[] = [];
    const sectionNotStarted: string[] = [];
    const sectionReviewed: string[] = [];

    const subjectsWithProgress = section.subjects.map((subject) => {
      const subjectTopics: string[] = [];
      const subjectCompleted: string[] = [];
      const subjectInProgress: string[] = [];
      const subjectNotStarted: string[] = [];
      const subjectReviewed: string[] = [];

      const topicsWithStatus = subject.topics.map((topic) => {
        sectionTopics.push(topic.id);
        subjectTopics.push(topic.id);
        const status = progressMap.get(topic.id) || 'NOT_STARTED';
        const questionStats = questionStatsMap.get(topic.id) || {
          totalQuestions: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
        };

        const normalizedStatus = status === 'REVIEWED' ? 'COMPLETED' : status;
        const finalStatus =
          normalizedStatus === 'COMPLETED'
            ? 'COMPLETED'
            : normalizedStatus === 'IN_PROGRESS'
              ? 'IN_PROGRESS'
              : 'NOT_STARTED';

        if (finalStatus === 'COMPLETED' || status === 'REVIEWED') {
          sectionCompleted.push(topic.id);
          subjectCompleted.push(topic.id);
        } else if (finalStatus === 'IN_PROGRESS') {
          sectionInProgress.push(topic.id);
          subjectInProgress.push(topic.id);
        } else {
          sectionNotStarted.push(topic.id);
          subjectNotStarted.push(topic.id);
        }

        if (status === 'REVIEWED') {
          sectionReviewed.push(topic.id);
          subjectReviewed.push(topic.id);
        }

        const evaluation = evaluationMap.get(topic.id) || null;

        return {
          id: topic.id,
          code: topic.code,
          name: topic.name,
          order: topic.order,
          examQuestionCount: topic.examQuestionCount ?? null,
          status: finalStatus as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED',
          totalQuestions: questionStats.totalQuestions,
          correctAnswers: questionStats.correctAnswers,
          wrongAnswers: questionStats.wrongAnswers,
          evaluation,
        };
      });

      const subjectTotal = subjectTopics.length;
      const subjectCompletedCount = subjectCompleted.length;
      const subjectInProgressCount = subjectInProgress.length;
      const subjectNotStartedCount = subjectNotStarted.length;
      const subjectReviewedCount = subjectReviewed.length;

      const subjectProgress =
        subjectTotal > 0 ? Math.round(((subjectCompletedCount + subjectReviewedCount) / subjectTotal) * 100) : 0;

      return {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        order: subject.order,
        totalTopics: subjectTotal,
        completedTopics: subjectCompletedCount,
        inProgressTopics: subjectInProgressCount,
        notStartedTopics: subjectNotStartedCount,
        reviewedTopics: subjectReviewedCount,
        progressPercentage: subjectProgress,
        topics: topicsWithStatus,
      };
    });

    const sectionTotal = sectionTopics.length;
    const sectionCompletedCount = sectionCompleted.length;
    const sectionInProgressCount = sectionInProgress.length;
    const sectionNotStartedCount = sectionNotStarted.length;
    const sectionReviewedCount = sectionReviewed.length;

    const sectionProgress =
      sectionTotal > 0 ? Math.round(((sectionCompletedCount + sectionReviewedCount) / sectionTotal) * 100) : 0;

    return {
      id: section.id,
      code: section.code,
      name: section.name,
      order: section.order,
      totalTopics: sectionTotal,
      completedTopics: sectionCompletedCount,
      inProgressTopics: sectionInProgressCount,
      notStartedTopics: sectionNotStartedCount,
      reviewedTopics: sectionReviewedCount,
      progressPercentage: sectionProgress,
      subjects: subjectsWithProgress,
    };
  });

  let evaluationSummary: {
    targetScore: number;
    totalExamQuestions: number;
    requiredNet: number;
    requiredSuccessRate: number;
  } | null = null;
  if (evaluationConfig && requiredNet !== null && requiredSuccessRate !== null) {
    evaluationSummary = {
      targetScore,
      totalExamQuestions,
      requiredNet,
      requiredSuccessRate,
    };
  }

  return {
    user: { id: user.id },
    detail: {
      exam: activeExamAssignment.exam,
      sections: sectionsWithProgress,
      evaluation: evaluationSummary,
    },
  };
}
