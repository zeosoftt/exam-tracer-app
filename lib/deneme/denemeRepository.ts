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

export type CreateDenemeAttemptData = Parameters<typeof prisma.examAttempt.create>[0]['data'];

export async function createDenemeAttempt(data: CreateDenemeAttemptData) {
  return prisma.examAttempt.create({
    data,
    include: { exam: { select: { id: true, name: true, code: true } } },
  });
}
