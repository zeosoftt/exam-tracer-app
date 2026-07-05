/**
 * PATCH /api/super-admin/exam-content/topics/[id]
 * DELETE /api/super-admin/exam-content/topics/[id] (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminHandler } from '@/lib/api/withAdminHandler';
import { assertPrismaOrThrow } from '@/lib/api/prismaErrors';
import { prisma } from '@/lib/db/prisma';
import { HTTP_STATUS } from '@/config/constants';

type RouteParams = { params: Promise<{ id: string }> };

async function patchTopicHandler(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Geçersiz id.' },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  const body = await req.json();
  const { name, code, description, order, examQuestionCount } = body as {
    name?: string;
    code?: string;
    description?: string;
    order?: number;
    examQuestionCount?: number | null;
  };

  const data: {
    name?: string;
    code?: string;
    description?: string | null;
    order?: number;
    examQuestionCount?: number | null;
  } = {};
  if (typeof name === 'string') data.name = name.trim();
  if (typeof code === 'string') data.code = code.trim();
  if (description !== undefined) data.description = description?.trim() || null;
  if (typeof order === 'number') data.order = order;
  if (examQuestionCount !== undefined) {
    data.examQuestionCount = typeof examQuestionCount === 'number' ? examQuestionCount : null;
  }

  try {
    const topic = await prisma.topic.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: topic });
  } catch (error) {
    assertPrismaOrThrow(error, {
      P2025: 'Konu bulunamadı.',
      P2002: 'Bu konu kodu zaten kullanılıyor.',
    });
  }
}

async function deleteTopicHandler(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Geçersiz id.' },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  try {
    await prisma.topic.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    assertPrismaOrThrow(error, { P2025: 'Konu bulunamadı.' });
  }
}

export const PATCH = withAdminHandler(patchTopicHandler);
export const DELETE = withAdminHandler(deleteTopicHandler);
