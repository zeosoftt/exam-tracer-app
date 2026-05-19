/**
 * GET /api/super-admin/exam-content
 * Returns full tree: exams → sections → subjects → topics (deletedAt: null)
 * Sadece ADMIN rolü erişebilir.
 */

import { NextResponse } from 'next/server';
import { guardAdminSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/db/prisma';
import { HTTP_STATUS } from '@/config/constants';

export async function GET() {
  const guard = await guardAdminSession();
  if (!guard.authorized) return guard.response;

  try {
    const exams = await prisma.exam.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: {
        sections: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
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
                    subjectId: true,
                    name: true,
                    code: true,
                    description: true,
                    order: true,
                    examQuestionCount: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { exams },
    });
  } catch (error) {
    console.error('exam-content GET', error);
    return NextResponse.json(
      { success: false, error: 'İçerik ağacı yüklenemedi.' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
