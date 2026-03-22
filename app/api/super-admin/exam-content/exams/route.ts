/**
 * POST /api/super-admin/exam-content/exams - Create exam. Sadece ADMIN.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { USER_ROLES, HTTP_STATUS, ERROR_MESSAGES, EXAM_STATUS } from '@/config/constants';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.UNAUTHORIZED },
      { status: HTTP_STATUS.UNAUTHORIZED }
    );
  }
  if (session.user.role !== USER_ROLES.ADMIN) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.FORBIDDEN },
      { status: HTTP_STATUS.FORBIDDEN }
    );
  }
  try {
    const body = await req.json();
    const name = body?.name;
    const code = body?.code;
    const description = body?.description;
    const status = body?.status;
    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: 'name ve code zorunludur.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    const statusVal = status === EXAM_STATUS.INACTIVE || status === EXAM_STATUS.ARCHIVED ? status : EXAM_STATUS.ACTIVE;
    const startDate = body?.startDate && String(body.startDate).trim() ? new Date(String(body.startDate).trim()) : null;
    const exam = await prisma.exam.create({
      data: {
        name: String(name).trim(),
        code: String(code).trim().toUpperCase(),
        description: description ? String(description).trim() : null,
        status: statusVal,
        startDate,
      },
    });
    return NextResponse.json({ success: true, data: exam });
  } catch (e: unknown) {
    const err = e as { code?: string };
    const msg = err?.code === 'P2002' ? 'Bu sınav kodu zaten kullanılıyor.' : 'Sınav oluşturulamadı.';
    return NextResponse.json(
      { success: false, error: msg },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
