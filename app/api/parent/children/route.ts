/**
 * GET /api/parent/children — veliye bağlı öğrenciler (kurumsal veli rolü gerekir)
 */

import { NextResponse } from 'next/server';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { listLinkedStudentsForParent } from '@/lib/parent/listLinkedStudents';
import { userCanViewParentChildrenPanel } from '@/lib/parent/canViewParentChildrenPanel';
import { ForbiddenError } from '@/lib/errors/AppError';

async function getParentChildrenHandler(): Promise<NextResponse> {
  const session = await requireSession();
  const userId = getSessionUserId(session);

  if (!(await userCanViewParentChildrenPanel(userId))) {
    throw new ForbiddenError();
  }

  const students = await listLinkedStudentsForParent(userId);

  return NextResponse.json({
    success: true,
    data: { students },
  });
}

export const GET = asyncHandler(getParentChildrenHandler);
