/**
 * Deneme Takibi API
 * GET /api/deneme — Kullanıcının deneme listesi (examId opsiyonel)
 * POST /api/deneme — Yeni deneme kaydı ekle
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { HTTP_STATUS } from '@/config/constants';
import { getTopicCompletionByExamIds } from '@/lib/services/topic/topicCompletionByExam';
import { denemeAccessDeniedResponse } from '@/lib/deneme/denemeAccess';
import { computeDenemeScores } from '@/lib/deneme/computeDenemeScores';
import {
  createDenemeAttempt,
  findActiveExamById,
  findUserActiveExamAssignment,
  listUserDenemeAttempts,
  mapDenemeAttemptToDto,
} from '@/lib/deneme/denemeRepository';
import { prisma } from '@/lib/db/prisma';
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
  const session = await requireSession();
  const userId = getSessionUserId(session);

  const denied = await denemeAccessDeniedResponse(userId);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const examId = searchParams.get('examId') ?? undefined;
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const skip = (page - 1) * limit;

  const { attempts, total } = await listUserDenemeAttempts(userId, { examId, limit, skip });
  const data = attempts.map(mapDenemeAttemptToDto);

  const progressExamIdsParam = searchParams.get('progressExamIds');
  const extraProgressExamIds =
    progressExamIdsParam?.split(',').map((id) => id.trim()).filter(Boolean) ?? [];

  const examIdsFromAttempts = [...new Set(attempts.map((a) => a.examId))];
  const activeAssignment = await findUserActiveExamAssignment(userId);
  const examIdsForProgress = [
    ...new Set([...examIdsFromAttempts, activeAssignment?.examId, ...extraProgressExamIds].filter(Boolean)),
  ] as string[];
  const topicProgressByExam = await getTopicCompletionByExamIds(prisma, userId, examIdsForProgress);

  const primaryExamId = activeAssignment?.examId ?? examIdsFromAttempts[0] ?? null;
  const primaryTopicProgress =
    primaryExamId && topicProgressByExam[primaryExamId]
      ? {
          examId: primaryExamId,
          examName: activeAssignment?.exam?.name ?? attempts.find((a) => a.examId === primaryExamId)?.exam.name ?? null,
          ...topicProgressByExam[primaryExamId],
        }
      : null;

  return NextResponse.json({
    success: true,
    data,
    topicProgressByExam,
    primaryTopicProgress,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

async function postDenemeHandler(req: NextRequest): Promise<NextResponse> {
  const session = await requireSession();
  const userId = getSessionUserId(session);

  const denied = await denemeAccessDeniedResponse(userId);
  if (denied) return denied;

  const body = await req.json();
  const parsed = createDenemeSchema.safeParse(body);
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
    return NextResponse.json(
      { success: false, error: typeof first === 'string' ? first : 'Geçersiz veri.' },
      { status: HTTP_STATUS.BAD_REQUEST },
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

  const exam = await findActiveExamById(examId);
  if (!exam) {
    return NextResponse.json(
      { success: false, error: 'Sınav bulunamadı veya aktif değil.' },
      { status: HTTP_STATUS.NOT_FOUND },
    );
  }

  const scores = await computeDenemeScores({
    examId,
    examCode: exam.code,
    totalScore,
    netScore,
    rightCount,
    wrongCount,
    emptyCount,
    breakdown,
  });

  const createData: Parameters<typeof createDenemeAttempt>[0] = {
    userId,
    examId,
    attemptedAt: attemptedAt != null ? new Date(attemptedAt) : new Date(),
    status: 'COMPLETED',
  };
  if (scores.finalTotalScore != null && Number.isFinite(scores.finalTotalScore)) {
    createData.totalScore = scores.finalTotalScore;
  }
  if (scores.finalNetScore != null && Number.isFinite(scores.finalNetScore)) {
    createData.netScore = scores.finalNetScore;
  }
  if (scores.finalRightCount != null) createData.rightCount = scores.finalRightCount;
  if (scores.finalWrongCount != null) createData.wrongCount = scores.finalWrongCount;
  if (scores.finalEmptyCount != null) createData.emptyCount = scores.finalEmptyCount;
  if (durationMinutes != null) createData.durationMinutes = durationMinutes;
  if (scores.breakdownJson != null) createData.breakdown = scores.breakdownJson as object;
  if (notes != null && notes !== '') createData.notes = notes;

  try {
    const attempt = await createDenemeAttempt(createData);
    const dto = mapDenemeAttemptToDto(attempt);
    return NextResponse.json(
      {
        success: true,
        data: {
          id: dto.id,
          examId: dto.examId,
          exam: dto.exam,
          attemptedAt: dto.attemptedAt,
          totalScore: dto.totalScore,
          netScore: dto.netScore,
          rightCount: dto.rightCount,
          wrongCount: dto.wrongCount,
          emptyCount: dto.emptyCount,
          durationMinutes: dto.durationMinutes,
          status: dto.status,
          notes: dto.notes,
        },
      },
      { status: HTTP_STATUS.CREATED },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : undefined;
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'development' ? msg : 'Kayıt oluşturulurken bir hata oluştu.',
        ...(code && process.env.NODE_ENV === 'development' ? { code } : {}),
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}

export const GET = asyncHandler(getDenemeHandler);
export const POST = asyncHandler(postDenemeHandler);
