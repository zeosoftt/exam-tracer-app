/**
 * GET /api/exams/[id]/structure
 * Sınavın bölüm ve ders yapısını döner (deneme formunda ders ders giriş için)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/requireSession';
import { handleError } from '@/lib/errors/errorHandler';
import { prisma } from '@/lib/db/prisma';
import { HTTP_STATUS } from '@/config/constants';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireSession();

    const { id: examId } = await context.params;
    if (!examId) {
      return NextResponse.json({ error: 'examId gerekli' }, { status: HTTP_STATUS.BAD_REQUEST });
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
      return NextResponse.json({ error: 'Sınav bulunamadı' }, { status: HTTP_STATUS.NOT_FOUND });
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

    return NextResponse.json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
