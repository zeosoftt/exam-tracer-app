/**
 * POST /api/super-admin/exam-content/sections
 * Create section. Sadece ADMIN.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminHandler } from '@/lib/api/withAdminHandler';
import { assertPrismaOrThrow } from '@/lib/api/prismaErrors';
import { prisma } from '@/lib/db/prisma';
import { HTTP_STATUS } from '@/config/constants';

async function createSectionHandler(req: NextRequest): Promise<NextResponse> {
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
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  try {
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
  } catch (error) {
    assertPrismaOrThrow(error, {
      P2002: 'Bu bölüm kodu bu sınavda zaten var.',
      P2003: 'Geçersiz sınav.',
    });
  }
}

export const POST = withAdminHandler(createSectionHandler, 'super_admin.section.create');
