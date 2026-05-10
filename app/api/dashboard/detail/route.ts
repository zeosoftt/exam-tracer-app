/**
 * Dashboard Detail API
 * GET /api/dashboard/detail
 * Returns section and subject progress for active exam
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { prisma } from '@/lib/db/prisma';
import { logApi } from '@/lib/logger';
import { HTTP_STATUS } from '@/config/constants';
import { UnauthorizedError } from '@/lib/errors/AppError';
import { evaluateTopics, calculateRequiredSuccessRate } from '@/lib/services/targetScoreEvaluation';
import { getRequiredNet } from '@/config/targetScoreMaps';

export const dynamic = 'force-dynamic';

type DetailApiPayload = {
  success: true;
  data: {
    exam: unknown;
    sections: unknown[];
    evaluation: unknown;
  };
};

const DETAIL_CACHE_TTL_MS = 10_000;
const detailCache = new Map<string, { expiresAt: number; payload: DetailApiPayload }>();

async function getDetailHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new UnauthorizedError();
    }

    const userId = session.user.id;
    const forceRefresh = req.nextUrl.searchParams.get('fresh') === '1';
    if (!forceRefresh) {
      const cached = detailCache.get(userId);
      if (cached && cached.expiresAt > Date.now()) {
        const res = NextResponse.json(cached.payload);
        res.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');
        res.headers.set('X-Detail-Cache', 'HIT');
        return res;
      }
    }

    // Paralel: kullanıcı + aktif sınav ataması (2 round-trip yerine 1)
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
      throw new UnauthorizedError();
    }

    if (!activeExamAssignment?.exam?.id) {
      return NextResponse.json({
        success: true,
        data: { exam: null, sections: [] },
      });
    }

    const examId = activeExamAssignment.exam.id;
    const examCode = activeExamAssignment.exam.code;
    const targetScore = user.targetScore ?? 0;

    // Paralel: sections + userProgress (2 round-trip yerine 1)
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

    // Create maps for quick lookup
    const progressMap = new Map(
      userProgress.map((progress) => [progress.topicId, progress.status])
    );
    const questionStatsMap = new Map(
      userProgress.map((progress) => [
        progress.topicId,
        {
          totalQuestions: progress.totalQuestions ?? 0,
          correctAnswers: progress.correctAnswers ?? 0,
          wrongAnswers: progress.wrongAnswers ?? 0,
        },
      ])
    );

    // Calculate total exam questions (sum of all topics' questions or default to 120 for KPSS)
    // In future, this should come from Exam model
    const totalExamQuestions = 120; // Default for KPSS, can be made configurable per exam

    // Prepare evaluation config if targetScore is set
    const evaluationConfig = targetScore > 0 ? {
      targetScore,
      totalExamQuestions,
      examCode,
    } : null;

    // PRE-OPTIMIZATION: Calculate evaluation for all topics at once (instead of N times)
    const evaluationMap = new Map<string, {
      topicNet: number;
      topicSuccessRate: number;
      requiredSuccessRate: number;
      requiredNet: number;
      status: string;
      isGood: boolean;
      isImprovable: boolean;
      needsRepeat: boolean;
    }>();
    let requiredNet: number | null = null;
    let requiredSuccessRate: number | null = null;

    if (evaluationConfig) {
      // Collect all topics with questions for batch evaluation
      const topicsForEvaluation: Array<{
        topicId: string;
        topicName: string;
        totalQuestions: number;
        correctAnswers: number;
        wrongAnswers: number;
      }> = [];

      // Prepare topics data
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

      // Batch evaluate all topics at once (1 call instead of N calls)
      if (topicsForEvaluation.length > 0) {
        const evaluations = evaluateTopics(topicsForEvaluation, evaluationConfig);
        
        // Pre-calculate required values (once instead of N times)
        requiredNet = getRequiredNet(evaluationConfig.targetScore, examCode);
        requiredSuccessRate = calculateRequiredSuccessRate(evaluationConfig);
        
        // Create evaluation map for O(1) lookup
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

    // Calculate progress for each section and subject
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

        // Map topics with their status
        const topicsWithStatus = subject.topics.map((topic) => {
          sectionTopics.push(topic.id);
          subjectTopics.push(topic.id);
          const status = progressMap.get(topic.id) || 'NOT_STARTED';
          const questionStats = questionStatsMap.get(topic.id) || {
            totalQuestions: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
          };
          
          // Count by status
          // REVIEWED durumunu COMPLETED olarak say
          const normalizedStatus = status === 'REVIEWED' ? 'COMPLETED' : status;
          const finalStatus = normalizedStatus === 'COMPLETED' 
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
          
          // OPTIMIZED: Get evaluation from pre-calculated map (O(1) lookup)
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
        
        // Progress: completed + reviewed as completed
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
      
      // Progress: completed + reviewed as completed
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

    logApi('GET', '/api/dashboard/detail', HTTP_STATUS.OK, undefined, { userId });

    let evaluationSummary = null;
    if (evaluationConfig && requiredNet !== null && requiredSuccessRate !== null) {
      evaluationSummary = {
        targetScore,
        totalExamQuestions,
        requiredNet,
        requiredSuccessRate,
      };
    }

    const payload: DetailApiPayload = {
      success: true,
      data: {
        exam: activeExamAssignment.exam,
        sections: sectionsWithProgress,
        evaluation: evaluationSummary,
      },
    };
    detailCache.set(userId, {
      expiresAt: Date.now() + DETAIL_CACHE_TTL_MS,
      payload,
    });

    const res = NextResponse.json(payload);
    res.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30');
    res.headers.set('X-Detail-Cache', 'MISS');
    return res;
  } catch (error) {
    return handleError(error);
  }
}

export const GET = asyncHandler(getDetailHandler);
