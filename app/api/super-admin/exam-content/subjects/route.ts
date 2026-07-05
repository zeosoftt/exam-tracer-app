/**
 * POST /api/super-admin/exam-content/subjects - Create subject.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminHandler } from '@/lib/api/withAdminHandler';
import { assertPrismaOrThrow } from '@/lib/api/prismaErrors';
import { prisma } from '@/lib/db/prisma';
import { HTTP_STATUS } from '@/config/constants';

async function createSubjectHandler(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const sectionId = body?.sectionId;
  const name = body?.name;
  const code = body?.code;
  const description = body?.description;
  const order = body?.order;

  if (!sectionId || !name || !code) {
    return NextResponse.json(
      { success: false, error: 'sectionId, name ve code zorunludur.' },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  try {
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
  } catch (error) {
    assertPrismaOrThrow(error, {
      P2002: 'Bu ders kodu bu bölümde zaten var.',
      P2003: 'Geçersiz bölüm.',
    });
  }
}

export const POST = withAdminHandler(createSubjectHandler);
