/**
 * GET /api/exams/[id]/structure
 * Sınavın bölüm ve ders yapısını döner (deneme formunda ders ders giriş için)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { jsonOk } from '@/lib/api/responses';
import { userHasExamAssignment } from '@/lib/exams/examAccessRepository';
import { ForbiddenError, BadRequestError, NotFoundError } from '@/lib/errors/AppError';
import { prisma } from '@/lib/db/prisma';

async function getExamStructureHandler(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await requireSession();
  const userId = getSessionUserId(session);
  const { id: examId } = await context.params;

  if (!examId) {
    throw new BadRequestError('examId gerekli');
  }

  const hasAccess = await userHasExamAssignment(userId, examId);
  if (!hasAccess) {
    throw new ForbiddenError('Bu sınav yapısına erişim yetkiniz yok.');
  }

  const exam = await prisma.exam.findFirst({
    where: { id: examId, status: 'ACTIVE', deletedAt: null },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          subjects: {
            orderBy: { order: 'asc' },
            select: { id: true, name: true, code: true, order: true },
          },
        },
      },
    },
  });

  if (!exam) {
    throw new NotFoundError('Sınav bulunamadı');
  }

  const subjects = exam.sections.flatMap((s) =>
    s.subjects.map((sub) => ({
      id: sub.id,
      name: sub.name,
      code: sub.code,
      sectionName: s.name,
      order: sub.order,
    })),
  );

  return jsonOk({
    examId: exam.id,
    examName: exam.name,
    examCode: exam.code,
    sections: exam.sections.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      subjects: s.subjects,
    })),
    subjects,
  });
}

export const GET = asyncHandler(getExamStructureHandler);
