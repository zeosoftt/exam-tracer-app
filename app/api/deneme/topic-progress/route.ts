/**
 * GET /api/deneme/topic-progress?examIds=a,b — sınav bazında konu tamamlanma özeti.
 *
 * Deneme sayfası ilk HTML'de liste ile gelir; konu ilerlemesi arka planda bu hafif uçtan alınır.
 * Eskiden aynı amaçla 50 deneme kaydı yeniden çekiliyordu.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { prisma } from '@/lib/db/prisma';
import { getTopicCompletionByExamIds } from '@/lib/services/topic/topicCompletionByExam';
import { findUserActiveExamAssignment } from '@/lib/deneme/denemeRepository';

export const dynamic = 'force-dynamic';

const MAX_EXAM_IDS = 20;

async function getDenemeTopicProgressHandler(req: NextRequest): Promise<NextResponse> {
  const session = await requireSession();
  const userId = getSessionUserId(session);

  const requestedIds =
    req.nextUrl.searchParams
      .get('examIds')
      ?.split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, MAX_EXAM_IDS) ?? [];

  const activeAssignment = await findUserActiveExamAssignment(userId);
  const examIds = [...new Set([...requestedIds, activeAssignment?.examId].filter(Boolean))] as string[];

  const topicProgressByExam = await getTopicCompletionByExamIds(prisma, userId, examIds);

  const primaryExamId = activeAssignment?.examId ?? examIds[0] ?? null;
  let primaryTopicProgress: Record<string, unknown> | null = null;
  if (primaryExamId && topicProgressByExam[primaryExamId]) {
    let examName: string | null = activeAssignment?.exam?.name ?? null;
    if (!examName) {
      const exam = await prisma.exam.findUnique({ where: { id: primaryExamId }, select: { name: true } });
      examName = exam?.name ?? null;
    }
    primaryTopicProgress = { examId: primaryExamId, examName, ...topicProgressByExam[primaryExamId] };
  }

  return NextResponse.json({ success: true, topicProgressByExam, primaryTopicProgress });
}

export const GET = asyncHandler(getDenemeTopicProgressHandler);
