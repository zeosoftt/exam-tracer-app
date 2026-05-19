/**
 * POST /api/super-admin/exam-content/sections
 * Create section. Sadece ADMIN.
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
    const { examId, name, code, description, order } = body as {
      examId?: string;
      name?: string;
      code?: string;
      description?: string;
      order?: number;
    };
    if (!examId || !name || !code) {
      return NextResponse.json(
        { success: false, error: 'examId, name ve code zorunludur.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    const section = await prisma.section.create({
      data: {
        examId,
        name: name.trim(),
        code: code.trim(),
        description: description?.trim() || null,
        order: typeof order === 'number' ? order : 0,
      },
    });
    return NextResponse.json({ success: true, data: section });
  } catch (e: unknown) {
    const code = e && typeof e === 'object' && 'code' in e ? (e as { code: string }).code : null;
    const msg = code === 'P2002' ? 'Bu bölüm kodu bu sınavda zaten var.' : code === 'P2003' ? 'Geçersiz sınav.' : 'Bölüm oluşturulamadı.';
    return NextResponse.json(
      { success: false, error: msg },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
