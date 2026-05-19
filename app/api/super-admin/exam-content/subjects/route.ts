/**
 * POST /api/super-admin/exam-content/subjects - Create subject.
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/db/prisma';
import { HTTP_STATUS } from '@/config/constants';

export async function POST(req: NextRequest) {
  const guard = await guardAdminSession();
  if (!guard.authorized) return guard.response;
  try {
    const body = await req.json();
    const sectionId = body?.sectionId;
    const name = body?.name;
    const code = body?.code;
    const description = body?.description;
    const order = body?.order;
    if (!sectionId || !name || !code) {
      return NextResponse.json(
        { success: false, error: 'sectionId, name ve code zorunludur.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    const subject = await prisma.subject.create({
      data: {
        sectionId,
        name: String(name).trim(),
        code: String(code).trim(),
        description: description ? String(description).trim() : null,
        order: typeof order === 'number' ? order : 0,
      },
    });
    return NextResponse.json({ success: true, data: subject });
  } catch (e: unknown) {
    const err = e as { code?: string };
    const msg = err?.code === 'P2002' ? 'Bu ders kodu bu bölümde zaten var.' : err?.code === 'P2003' ? 'Geçersiz bölüm.' : 'Ders oluşturulamadı.';
    return NextResponse.json(
      { success: false, error: msg },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
