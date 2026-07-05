/**
 * POST /api/super-admin/exam-content/exams - Create exam. Sadece ADMIN.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminHandler } from '@/lib/api/withAdminHandler';
import { assertPrismaOrThrow } from '@/lib/api/prismaErrors';
import { prisma } from '@/lib/db/prisma';
import { EXAM_STATUS } from '@/config/constants';
import { validate } from '@/lib/validation/validate';
import { adminCreateExamSchema } from '@/lib/validation/schemas';

async function createExamContentHandler(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const data = validate(adminCreateExamSchema, body);

  const statusVal =
    data.status === EXAM_STATUS.INACTIVE || data.status === EXAM_STATUS.ARCHIVED
      ? data.status
      : EXAM_STATUS.ACTIVE;

  try {
    const exam = await prisma.exam.create({
      data: {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        description: data.description?.trim() ?? null,
        status: statusVal,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
      },
    });
    return NextResponse.json({ success: true, data: exam });
  } catch (error) {
    assertPrismaOrThrow(error, {
      P2002: 'Bu sınav kodu zaten kullanılıyor.',
    });
  }
}

export const POST = withAdminHandler(createExamContentHandler);
