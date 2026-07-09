/**
 * PATCH/DELETE subjects/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminHandler } from '@/lib/api/withAdminHandler';
import { assertPrismaOrThrow } from '@/lib/api/prismaErrors';
import { prisma } from '@/lib/db/prisma';
import { HTTP_STATUS } from '@/config/constants';

type RouteParams = { params: Promise<{ id: string }> };

async function patchSubjectHandler(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Geçersiz id.' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const body = await req.json();
  const data: { name?: string; code?: string; description?: string | null; order?: number } = {};
  if (typeof body.name === 'string') data.name = body.name.trim();
  if (typeof body.code === 'string') data.code = body.code.trim();
  if (body.description !== undefined) data.description = body.description ? String(body.description).trim() : null;
  if (typeof body.order === 'number') data.order = body.order;

  try {
    const subject = await prisma.subject.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: subject });
  } catch (error) {
    assertPrismaOrThrow(error, {
      P2025: 'Ders bulunamadı.',
      P2002: 'Bu ders kodu zaten kullanılıyor.',
    });
  }
}

async function deleteSubjectHandler(_req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Geçersiz id.' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  try {
    await prisma.subject.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    assertPrismaOrThrow(error, { P2025: 'Ders bulunamadı.' });
  }
}

export const PATCH = withAdminHandler(patchSubjectHandler, 'super_admin.subject.update');
export const DELETE = withAdminHandler(deleteSubjectHandler, 'super_admin.subject.delete');
