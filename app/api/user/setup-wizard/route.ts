/**
 * Kurulum sihirbazı — durum (GET) ve tamamla / atla (POST)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { HTTP_STATUS, USER_ROLES } from '@/config/constants';
import { UnauthorizedError } from '@/lib/errors/AppError';
import { ProgressStatus, type PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { computeInitialNextReview } from '@/lib/utils/spacedRepetition';
import { getMaxScoreForExam } from '@/lib/constants/examScoreRanges';
import { SETUP_WIZARD_SAMPLE_DENEME, setupWizardSampleDenemeNet } from '@/lib/setup-wizard/sampleDeneme';
import { computeSetupWizardTopicPlan, type SetupWizardExamInput } from '@/lib/setup-wizard/topicPresetSelection';
import { ensureSetupWizardColumnOnce } from '@/lib/db/ensureSetupWizardColumn';
import { isMissingSetupWizardColumnError } from '@/lib/db/setupWizardColumnSupport';

const WIZARD_SKIP_ROLES = new Set<string>([USER_ROLES.ADMIN, USER_ROLES.VIEWER]);

const postBodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('skip') }),
  z.object({
    action: z.literal('finish'),
    examId: z.string().min(1),
    progressPreset: z.enum(['none', 'starter', 'solid']),
    addSampleDeneme: z.boolean(),
  }),
]);

async function loadExamInputForSetup(
  db: PrismaClient,
  examId: string,
): Promise<{ code: string; examInput: SetupWizardExamInput } | null> {
  const exam = await db.exam.findFirst({
    where: { id: examId, status: 'ACTIVE', deletedAt: null },
    select: {
      code: true,
      sections: {
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
        select: {
          subjects: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
            select: {
              name: true,
              topics: {
                where: { deletedAt: null },
                orderBy: { order: 'asc' },
                select: { id: true, name: true },
              },
            },
          },
        },
      },
    },
  });
  if (!exam) return null;
  const examInput: SetupWizardExamInput = {
    sections: exam.sections.map((s) => ({
      subjects: s.subjects.map((sub) => ({
        name: sub.name,
        topics: sub.topics.map((t) => ({ id: t.id, name: t.name })),
      })),
    })),
  };
  return { code: exam.code, examInput };
}

async function getSetupWizardHandler(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  const userId = session.user.id;
  const role = session.user.role ?? '';

  if (WIZARD_SKIP_ROLES.has(role)) {
    return NextResponse.json({
      success: true,
      data: { completed: true, assignments: [], availableExams: [] },
    });
  }

  let user: { setupWizardCompletedAt: Date | null } | null;
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { setupWizardCompletedAt: true },
    });
  } catch (e) {
    if (isMissingSetupWizardColumnError(e)) {
      return NextResponse.json({
        success: true,
        data: { completed: true, assignments: [], availableExams: [] },
      });
    }
    throw e;
  }

  if (user?.setupWizardCompletedAt) {
    return NextResponse.json({
      success: true,
      data: { completed: true, assignments: [], availableExams: [] },
    });
  }

  const assignments = await prisma.examAssignment.findMany({
    where: {
      userId,
      deletedAt: null,
      exam: { status: 'ACTIVE', deletedAt: null },
    },
    orderBy: { assignedAt: 'desc' },
    include: {
      exam: { select: { id: true, name: true, code: true } },
    },
  });

  const assignmentList = assignments.map((a) => ({
    examId: a.exam.id,
    name: a.exam.name,
    code: a.exam.code,
  }));

  let availableExams: { examId: string; name: string; code: string }[] = [];
  if (assignmentList.length === 0) {
    const exams = await prisma.exam.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
      take: 40,
    });
    availableExams = exams.map((e) => ({ examId: e.id, name: e.name, code: e.code }));
  }

  return NextResponse.json({
    success: true,
    data: {
      completed: false,
      assignments: assignmentList,
      availableExams,
    },
  });
}

async function postSetupWizardHandler(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  const userId = session.user.id;
  const role = session.user.role ?? '';

  if (WIZARD_SKIP_ROLES.has(role)) {
    return NextResponse.json({ success: true, data: { done: true } });
  }

  await ensureSetupWizardColumnOnce(prisma);

  const raw = await req.json().catch(() => ({}));
  const parsed = postBodySchema.safeParse(raw);
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
    return NextResponse.json(
      { success: false, error: typeof first === 'string' ? first : 'Geçersiz istek.' },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  let existing: { setupWizardCompletedAt: Date | null } | null;
  try {
    existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { setupWizardCompletedAt: true },
    });
  } catch (e) {
    if (isMissingSetupWizardColumnError(e)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Veritabanı şeması güncel değil. Geliştirme ortamında: npx prisma migrate dev — üretimde: npx prisma migrate deploy',
        },
        { status: HTTP_STATUS.SERVICE_UNAVAILABLE },
      );
    }
    throw e;
  }

  if (existing?.setupWizardCompletedAt) {
    return NextResponse.json({ success: true, data: { done: true } });
  }

  if (parsed.data.action === 'skip') {
    await prisma.user.update({
      where: { id: userId },
      data: { setupWizardCompletedAt: new Date() },
    });
    return NextResponse.json({ success: true, data: { done: true } });
  }

  const { examId, progressPreset, addSampleDeneme } = parsed.data;

  const loadedPlan = await loadExamInputForSetup(prisma, examId);
  if (!loadedPlan) {
    return NextResponse.json(
      { success: false, error: 'Sınav bulunamadı, aktif değil veya müfredat yüklenemedi.' },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }
  const { code: examCode, examInput } = loadedPlan;
  const { topicIds: chosenTopicIds } = computeSetupWizardTopicPlan(progressPreset, examInput);

  /** Çok sayıda upsert + uzak DB: varsayılan 5s interactive tx zaman aşımına takılabiliyor (P2028 benzeri / "Transaction not found"). */
  const TX_MAX_WAIT_MS = 20_000;
  const TX_TIMEOUT_MS = 120_000;
  /** Aynı anda çok fazla paralel sorgu (özellikle solid + çok ders) pooler’ı zorlayabilir; makul üst sınır. */
  const USER_PROGRESS_UPSERT_CHUNK = 48;

  await prisma.$transaction(
    async (tx) => {
      const assignment = await tx.examAssignment.findFirst({
        where: { userId, examId, deletedAt: null },
      });
      if (!assignment) {
        const prev = await tx.examAssignment.findFirst({
          where: { userId, deletedAt: null },
          orderBy: { assignedAt: 'desc' },
        });
        if (prev && prev.examId !== examId) {
          await tx.examAssignment.update({
            where: { id: prev.id },
            data: { deletedAt: new Date() },
          });
        }
        await tx.examAssignment.create({
          data: { userId, examId },
        });
      }

      const completedAt = new Date();
      const nextReviewAt = computeInitialNextReview(completedAt);
      const progressPayload = {
        status: ProgressStatus.COMPLETED,
        completedAt,
        spacedRepetitionLevel: 0,
        nextReviewAt,
        lastReviewedAt: null as Date | null,
      };

      for (let i = 0; i < chosenTopicIds.length; i += USER_PROGRESS_UPSERT_CHUNK) {
        const chunk = chosenTopicIds.slice(i, i + USER_PROGRESS_UPSERT_CHUNK);
        await Promise.all(
          chunk.map((topicId) =>
            tx.userProgress.upsert({
              where: { userId_topicId: { userId, topicId } },
              update: progressPayload,
              create: {
                userId,
                topicId,
                ...progressPayload,
              },
            }),
          ),
        );
      }

      if (addSampleDeneme) {
        const { rightCount: right, wrongCount: wrong, emptyCount: empty, durationMinutes, daysAgo, notes } =
          SETUP_WIZARD_SAMPLE_DENEME;
        const net = setupWizardSampleDenemeNet();
        const totalQ = right + wrong + empty;
        const maxScore = getMaxScoreForExam(examCode);
        const totalScore =
          totalQ > 0
            ? Math.max(0, Math.min(maxScore, Math.round(((net / totalQ) * maxScore + Number.EPSILON) * 100) / 100))
            : null;

        await tx.examAttempt.create({
          data: {
            userId,
            examId,
            attemptedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
            status: 'COMPLETED',
            rightCount: right,
            wrongCount: wrong,
            emptyCount: empty,
            netScore: net,
            totalScore: totalScore ?? undefined,
            durationMinutes,
            notes,
          },
        });
      }

      await tx.user.update({
        where: { id: userId },
        data: { setupWizardCompletedAt: new Date() },
      });
    },
    { maxWait: TX_MAX_WAIT_MS, timeout: TX_TIMEOUT_MS },
  );

  return NextResponse.json({ success: true, data: { done: true } });
}

export const GET = asyncHandler(getSetupWizardHandler);
export const POST = asyncHandler(postSetupWizardHandler);
