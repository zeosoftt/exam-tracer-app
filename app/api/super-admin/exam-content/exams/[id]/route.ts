/**
 * PATCH/DELETE /api/super-admin/exam-content/exams/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminSession } from '@/lib/auth/requireSession';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { HTTP_STATUS, EXAM_STATUS } from '@/config/constants';

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
    const data: Prisma.ExamUpdateInput = {};
    if (typeof body.name === 'string') data.name = body.name.trim();
    if (typeof body.code === 'string') data.code = body.code.trim().toUpperCase();
    if (body.description !== undefined) data.description = body.description ? String(body.description).trim() : null;
    if (body.status === EXAM_STATUS.ACTIVE || body.status === EXAM_STATUS.INACTIVE || body.status === EXAM_STATUS.ARCHIVED) {
      data.status = body.status as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    }
    if (body.startDate !== undefined) {
      data.startDate = body.startDate === null || body.startDate === '' ? null : new Date(body.startDate);
    }
    if (body.endDate !== undefined) {
      data.endDate = body.endDate === null || body.endDate === '' ? null : new Date(body.endDate);
    }
    const exam = await prisma.exam.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: exam });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Sınav bulunamadı.' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }
    if (err?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Bu sınav kodu zaten kullanılıyor.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Sınav güncellenemedi.' },
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
    await prisma.exam.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Sınav bulunamadı.' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Sınav silinemedi.' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
