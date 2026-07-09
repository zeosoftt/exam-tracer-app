/**
 * POST /api/super-admin/exam-content/topics - Create topic. Sadece ADMIN.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminHandler } from '@/lib/api/withAdminHandler';
import { assertPrismaOrThrow } from '@/lib/api/prismaErrors';
import { prisma } from '@/lib/db/prisma';
import { HTTP_STATUS } from '@/config/constants';

async function createTopicHandler(req: NextRequest): Promise<NextResponse> {
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
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  try {
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
  } catch (error) {
    assertPrismaOrThrow(error, {
      P2002: 'Bu konu kodu bu derste zaten var.',
      P2003: 'Geçersiz ders.',
    });
  }
}

export const POST = withAdminHandler(createTopicHandler, 'super_admin.topic.create');
