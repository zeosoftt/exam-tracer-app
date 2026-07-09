/**
 * PATCH/DELETE /api/super-admin/exam-content/exams/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminHandler } from '@/lib/api/withAdminHandler';
import { assertPrismaOrThrow } from '@/lib/api/prismaErrors';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { HTTP_STATUS, EXAM_STATUS } from '@/config/constants';

type RouteParams = { params: Promise<{ id: string }> };

async function patchExamHandler(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Geçersiz id.' },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  const body = await req.json();
  const data: Prisma.ExamUpdateInput = {};
  if (typeof body.name === 'string') data.name = body.name.trim();
  if (typeof body.code === 'string') data.code = body.code.trim().toUpperCase();
  if (body.description !== undefined) data.description = body.description ? String(body.description).trim() : null;
  if (
    body.status === EXAM_STATUS.ACTIVE ||
    body.status === EXAM_STATUS.INACTIVE ||
    body.status === EXAM_STATUS.ARCHIVED
  ) {
    data.status = body.status as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  }
  if (body.startDate !== undefined) {
    data.startDate = body.startDate === null || body.startDate === '' ? null : new Date(body.startDate);
  }
  if (body.endDate !== undefined) {
    data.endDate = body.endDate === null || body.endDate === '' ? null : new Date(body.endDate);
  }

  try {
    const exam = await prisma.exam.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: exam });
  } catch (error) {
    assertPrismaOrThrow(error, {
      P2025: 'Sınav bulunamadı.',
      P2002: 'Bu sınav kodu zaten kullanılıyor.',
    });
  }
}

async function deleteExamHandler(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Geçersiz id.' },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  try {
    await prisma.exam.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    assertPrismaOrThrow(error, { P2025: 'Sınav bulunamadı.' });
  }
}

export const PATCH = withAdminHandler(patchExamHandler, 'super_admin.exam.update');
export const DELETE = withAdminHandler(deleteExamHandler, 'super_admin.exam.delete');
