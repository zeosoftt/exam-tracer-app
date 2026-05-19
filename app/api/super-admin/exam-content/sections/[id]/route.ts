/**
 * PATCH/DELETE sections/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/db/prisma';
import { HTTP_STATUS } from '@/config/constants';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardAdminSession();
  if (!guard.authorized) return guard.response;
  const { id } = await params;
  if (!id) return NextResponse.json({ success: false, error: 'Geçersiz id.' }, { status: HTTP_STATUS.BAD_REQUEST });
  try {
    const body = await req.json();
    const data: { name?: string; code?: string; description?: string | null; order?: number } = {};
    if (typeof body.name === 'string') data.name = body.name.trim();
    if (typeof body.code === 'string') data.code = body.code.trim();
    if (body.description !== undefined) data.description = body.description ? String(body.description).trim() : null;
    if (typeof body.order === 'number') data.order = body.order;
    const section = await prisma.section.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: section });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'P2025') return NextResponse.json({ success: false, error: 'Bölüm bulunamadı.' }, { status: HTTP_STATUS.NOT_FOUND });
    if (err?.code === 'P2002') return NextResponse.json({ success: false, error: 'Bu bölüm kodu zaten kullanılıyor.' }, { status: HTTP_STATUS.BAD_REQUEST });
    return NextResponse.json({ success: false, error: 'Bölüm güncellenemedi.' }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await guardAdminSession();
  if (!guard.authorized) return guard.response;
  const { id } = await params;
  if (!id) return NextResponse.json({ success: false, error: 'Geçersiz id.' }, { status: HTTP_STATUS.BAD_REQUEST });
  try {
    await prisma.section.update({ where: { id }, data: { deletedAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code === 'P2025') return NextResponse.json({ success: false, error: 'Bölüm bulunamadı.' }, { status: HTTP_STATUS.NOT_FOUND });
    return NextResponse.json({ success: false, error: 'Bölüm silinemedi.' }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
