/**
 * PATCH /api/super-admin/exam-content/topics/[id]
 * DELETE /api/super-admin/exam-content/topics/[id] (soft delete)
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/db/prisma';
import { HTTP_STATUS } from '@/config/constants';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardAdminSession();
  if (!guard.authorized) return guard.response;
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Geçersiz id.' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
  try {
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
    if (examQuestionCount !== undefined) data.examQuestionCount = typeof examQuestionCount === 'number' ? examQuestionCount : null;
    const topic = await prisma.topic.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: topic });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e) {
      const code = (e as { code: string }).code;
      if (code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Konu bulunamadı.' },
          { status: HTTP_STATUS.NOT_FOUND }
        );
      }
      if (code === 'P2002') {
        return NextResponse.json(
          { success: false, error: 'Bu konu kodu zaten kullanılıyor.' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    }
    return NextResponse.json(
      { success: false, error: 'Konu güncellenemedi.' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardAdminSession();
  if (!guard.authorized) return guard.response;
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Geçersiz id.' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
  try {
    await prisma.topic.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Konu bulunamadı.' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Konu silinemedi.' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
