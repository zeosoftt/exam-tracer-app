/**
 * Deneme Takibi API
 * GET /api/deneme — Kullanıcının deneme listesi (examId opsiyonel)
 * POST /api/deneme — Yeni deneme kaydı ekle
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { HTTP_STATUS } from '@/config/constants';
import { UnauthorizedError } from '@/lib/errors/AppError';
import { calculateFromBreakdown } from '@/lib/utils/denemeScore';
import { getMaxScoreForExam } from '@/lib/constants/examScoreRanges';
import { z } from 'zod';

const breakdownItemSchema = z.object({
  subjectId: z.string(),
  subjectName: z.string(),
  right: z.number().int().min(0),
  wrong: z.number().int().min(0),
  empty: z.number().int().min(0),
});

const createDenemeSchema = z.object({
  examId: z.string().min(1, 'Sınav seçiniz'),
  attemptedAt: z.union([z.string(), z.coerce.date()]).optional(),
  totalScore: z.number().min(0).optional().nullable(),
  netScore: z.number().optional().nullable(),
  rightCount: z.number().int().min(0).optional().nullable(),
  wrongCount: z.number().int().min(0).optional().nullable(),
  emptyCount: z.number().int().min(0).optional().nullable(),
  durationMinutes: z.number().int().min(0).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  breakdown: z.array(breakdownItemSchema).optional(),
});

async function getDenemeHandler(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  const { searchParams } = new URL(req.url);
  const examId = searchParams.get('examId') ?? undefined;
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const skip = (page - 1) * limit;

  const [attempts, total] = await Promise.all([
    prisma.examAttempt.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
        ...(examId ? { examId } : {}),
      },
      include: {
        exam: { select: { id: true, name: true, code: true } },
      },
      orderBy: { attemptedAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.examAttempt.count({
      where: {
        userId: session.user.id,
        deletedAt: null,
        ...(examId ? { examId } : {}),
      },
    }),
  ]);

  const data = attempts.map((a) => ({
    id: a.id,
    examId: a.examId,
    exam: a.exam,
    attemptedAt: a.attemptedAt.toISOString(),
    completedAt: a.completedAt?.toISOString() ?? null,
    totalScore: a.totalScore != null ? Number(a.totalScore) : null,
    netScore: a.netScore != null ? Number(a.netScore) : null,
    rightCount: a.rightCount,
    wrongCount: a.wrongCount,
    emptyCount: a.emptyCount,
    durationMinutes: a.durationMinutes,
    breakdown: a.breakdown as Array<{ subjectId: string; subjectName: string; right: number; wrong: number; empty: number; net: number }> | null,
    status: a.status,
    notes: a.notes,
  }));

  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

async function postDenemeHandler(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  const body = await req.json();
  const parsed = createDenemeSchema.safeParse(body);
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
    return NextResponse.json(
      { success: false, error: typeof first === 'string' ? first : 'Geçersiz veri.' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const {
    examId,
    attemptedAt,
    totalScore,
    netScore,
    rightCount,
    wrongCount,
    emptyCount,
    durationMinutes,
    notes,
    breakdown,
  } = parsed.data;

  let finalTotalScore = totalScore ?? undefined;
  let finalNetScore = netScore ?? undefined;
  let finalRightCount = rightCount ?? undefined;
  let finalWrongCount = wrongCount ?? undefined;
  let finalEmptyCount = emptyCount ?? undefined;
  let breakdownJson: unknown = undefined;

  // Sınavın var ve aktif olduğunu doğrula; puan ölçeği için code al
  const exam = await prisma.exam.findFirst({
    where: { id: examId, status: 'ACTIVE', deletedAt: null },
    select: { id: true, code: true },
  });
  if (!exam) {
    return NextResponse.json(
      { success: false, error: 'Sınav bulunamadı veya aktif değil.' },
      { status: HTTP_STATUS.NOT_FOUND }
    );
  }

  const maxScore = getMaxScoreForExam(exam.code);

  if (breakdown && breakdown.length > 0) {
    const calculated = calculateFromBreakdown(breakdown, { maxScore });
    breakdownJson = calculated.breakdownWithNet;
    finalTotalScore = finalTotalScore ?? calculated.calculatedScore;
    finalNetScore = finalNetScore ?? calculated.totalNet;
    finalRightCount = finalRightCount ?? calculated.totalRight;
    finalWrongCount = finalWrongCount ?? calculated.totalWrong;
    finalEmptyCount = finalEmptyCount ?? calculated.totalEmpty;
  } else if (
    (finalRightCount ?? 0) + (finalWrongCount ?? 0) + (finalEmptyCount ?? 0) > 0
  ) {
    const r = finalRightCount ?? 0;
    const w = finalWrongCount ?? 0;
    const e = finalEmptyCount ?? 0;
    const net = r - w / 4;
    const totalQ = r + w + e;
    finalNetScore = finalNetScore ?? net;
    if (totalQ > 0 && finalTotalScore == null) {
      finalTotalScore = Math.max(0, Math.min(maxScore, Math.round((net / totalQ) * maxScore * 100) / 100));
    }
  }

  const createData: Parameters<typeof prisma.examAttempt.create>[0]['data'] = {
    userId: session.user.id,
    examId,
    attemptedAt: attemptedAt != null ? new Date(attemptedAt) : new Date(),
    status: 'COMPLETED',
  };
  if (finalTotalScore != null && Number.isFinite(finalTotalScore)) {
    createData.totalScore = finalTotalScore;
  }
  if (finalNetScore != null && Number.isFinite(finalNetScore)) {
    createData.netScore = finalNetScore;
  }
  if (finalRightCount != null) createData.rightCount = finalRightCount;
  if (finalWrongCount != null) createData.wrongCount = finalWrongCount;
  if (finalEmptyCount != null) createData.emptyCount = finalEmptyCount;
  if (durationMinutes != null) createData.durationMinutes = durationMinutes;
  if (breakdownJson != null) createData.breakdown = breakdownJson as object;
  if (notes != null && notes !== '') createData.notes = notes;

  let attempt;
  try {
    attempt = await prisma.examAttempt.create({
      data: createData,
      include: {
        exam: { select: { id: true, name: true, code: true } },
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : undefined;
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'development' ? msg : 'Kayıt oluşturulurken bir hata oluştu.',
        ...(code && process.env.NODE_ENV === 'development' ? { code } : {}),
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        id: attempt.id,
        examId: attempt.examId,
        exam: attempt.exam,
        attemptedAt: attempt.attemptedAt.toISOString(),
        totalScore: attempt.totalScore != null ? Number(attempt.totalScore) : null,
        netScore: attempt.netScore != null ? Number(attempt.netScore) : null,
        rightCount: attempt.rightCount,
        wrongCount: attempt.wrongCount,
        emptyCount: attempt.emptyCount,
        durationMinutes: attempt.durationMinutes,
        status: attempt.status,
        notes: attempt.notes,
      },
    },
    { status: HTTP_STATUS.CREATED }
  );
}

export const GET = asyncHandler(getDenemeHandler);
export const POST = asyncHandler(postDenemeHandler);
