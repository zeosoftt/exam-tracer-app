/**
 * Deneme (practice test) Prisma erişimi — route tekrarını keser (DRY).
 */

import { prisma } from '@/lib/db/prisma';

export type DenemeExamSummary = { id: string; name: string; code: string };

export type DenemeAttemptRecord = {
  id: string;
  examId: string;
  exam: DenemeExamSummary;
  attemptedAt: Date;
  completedAt: Date | null;
  totalScore: unknown;
  netScore: unknown;
  rightCount: number | null;
  wrongCount: number | null;
  emptyCount: number | null;
  durationMinutes: number | null;
  breakdown: unknown;
  topicBreakdown: unknown;
  status: string;
  notes: string | null;
};

export type DenemeAttemptDto = {
  id: string;
  examId: string;
  exam: DenemeExamSummary;
  attemptedAt: string;
  completedAt: string | null;
  totalScore: number | null;
  netScore: number | null;
  rightCount: number | null;
  wrongCount: number | null;
  emptyCount: number | null;
  durationMinutes: number | null;
  breakdown: Array<{
    subjectId: string;
    subjectName: string;
    right: number;
    wrong: number;
    empty: number;
    net: number;
  }> | null;
  topicBreakdown: unknown;
  status: string;
  notes: string | null;
};

export function mapDenemeAttemptToDto(attempt: DenemeAttemptRecord): DenemeAttemptDto {
  return {
    id: attempt.id,
    examId: attempt.examId,
    exam: attempt.exam,
    attemptedAt: attempt.attemptedAt.toISOString(),
    completedAt: attempt.completedAt?.toISOString() ?? null,
    totalScore: attempt.totalScore != null ? Number(attempt.totalScore) : null,
    netScore: attempt.netScore != null ? Number(attempt.netScore) : null,
    rightCount: attempt.rightCount,
    wrongCount: attempt.wrongCount,
    emptyCount: attempt.emptyCount,
    durationMinutes: attempt.durationMinutes,
    breakdown: attempt.breakdown as DenemeAttemptDto['breakdown'],
    topicBreakdown: attempt.topicBreakdown ?? null,
    status: attempt.status,
    notes: attempt.notes,
  };
}

export async function listUserDenemeAttempts(
  userId: string,
  options: { examId?: string; limit: number; skip: number },
): Promise<{ attempts: DenemeAttemptRecord[]; total: number }> {
  const where = {
    userId,
    deletedAt: null,
    ...(options.examId ? { examId: options.examId } : {}),
  };

  const [attempts, total] = await Promise.all([
    prisma.examAttempt.findMany({
      where,
      include: { exam: { select: { id: true, name: true, code: true } } },
      orderBy: { attemptedAt: 'desc' },
      take: options.limit,
      skip: options.skip,
    }),
    prisma.examAttempt.count({ where }),
  ]);

  return { attempts, total };
}

export async function findUserActiveExamAssignment(userId: string) {
  return prisma.examAssignment.findFirst({
    where: { userId, deletedAt: null },
    orderBy: { assignedAt: 'desc' },
    select: { examId: true, exam: { select: { name: true, code: true } } },
  });
}

export async function findActiveExamById(examId: string) {
  return prisma.exam.findFirst({
    where: { id: examId, status: 'ACTIVE', deletedAt: null },
    select: { id: true, code: true },
  });
}

export async function findExamSectionsForScoring(examId: string) {
  return prisma.section.findMany({
    where: { examId },
    select: {
      code: true,
      subjects: { select: { id: true } },
    },
  });
}

export async function findExamSubjectsByExamId(examId: string) {
  return prisma.subject.findMany({
    where: { section: { examId, deletedAt: null }, deletedAt: null },
    select: { id: true, name: true, code: true },
    orderBy: [{ section: { order: 'asc' } }, { order: 'asc' }],
  });
}

export async function findExamTopicsByExamId(examId: string) {
  return prisma.topic.findMany({
    where: {
      deletedAt: null,
      subject: { deletedAt: null, section: { examId, deletedAt: null } },
    },
    select: {
      id: true,
      name: true,
      subject: { select: { id: true, name: true } },
    },
  });
}

export async function findUserDenemeAttemptById(userId: string, attemptId: string) {
  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, userId, deletedAt: null },
    include: { exam: { select: { id: true, name: true, code: true } } },
  });

  if (!attempt) return null;

  const topicBreakdown = await readTopicBreakdown(attemptId);
  return { ...attempt, topicBreakdown };
}

export type CreateDenemeAttemptData = Parameters<typeof prisma.examAttempt.create>[0]['data'];

export type CreateDenemeAttemptInput = CreateDenemeAttemptData & {
  topicBreakdown?: unknown;
};

async function persistTopicBreakdown(attemptId: string, topicBreakdown: unknown): Promise<void> {
  await prisma.$executeRawUnsafe(
    `UPDATE "exam_attempts" SET "topicBreakdown" = $1::jsonb, "updatedAt" = NOW() WHERE "id" = $2`,
    JSON.stringify(topicBreakdown),
    attemptId,
  );
}

async function readTopicBreakdown(attemptId: string): Promise<unknown> {
  const rows = await prisma.$queryRawUnsafe<Array<{ topicBreakdown: unknown }>>(
    `SELECT "topicBreakdown" FROM "exam_attempts" WHERE "id" = $1 LIMIT 1`,
    attemptId,
  );
  return rows[0]?.topicBreakdown ?? null;
}

export async function softDeleteUserDenemeAttempt(userId: string, attemptId: string): Promise<boolean> {
  const result = await prisma.examAttempt.updateMany({
    where: { id: attemptId, userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
  return result.count > 0;
}

export async function createDenemeAttempt(data: CreateDenemeAttemptInput) {
  const { topicBreakdown, ...prismaData } = data;

  const attempt = await prisma.examAttempt.create({
    data: prismaData as CreateDenemeAttemptData,
    include: { exam: { select: { id: true, name: true, code: true } } },
  });

  if (topicBreakdown != null) {
    await persistTopicBreakdown(attempt.id, topicBreakdown);
    return { ...attempt, topicBreakdown };
  }

  return attempt;
}
