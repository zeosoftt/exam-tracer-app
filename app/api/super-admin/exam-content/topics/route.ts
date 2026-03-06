/**
 * POST /api/super-admin/exam-content/topics - Create topic. Sadece ADMIN.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { USER_ROLES, HTTP_STATUS, ERROR_MESSAGES } from '@/config/constants';

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
    const subjectId = body?.subjectId;
    const name = body?.name;
    const code = body?.code;
    const description = body?.description;
    const order = body?.order;
    const examQuestionCount = body?.examQuestionCount;
    if (!subjectId || !name || !code) {
      return NextResponse.json(
        { success: false, error: 'subjectId, name ve code zorunludur.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    const topic = await prisma.topic.create({
      data: {
        subjectId,
        name: String(name).trim(),
        code: String(code).trim(),
        description: description ? String(description).trim() : null,
        order: typeof order === 'number' ? order : 0,
        examQuestionCount: typeof examQuestionCount === 'number' ? examQuestionCount : null,
      },
    });
    return NextResponse.json({ success: true, data: topic });
  } catch (e: unknown) {
    const err = e as { code?: string };
    const msg = err?.code === 'P2002' ? 'Bu konu kodu bu derste zaten var.' : err?.code === 'P2003' ? 'Geçersiz ders.' : 'Konu oluşturulamadı.';
    return NextResponse.json(
      { success: false, error: msg },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
