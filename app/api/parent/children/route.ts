/**
 * GET /api/parent/children — veliye bağlı öğrenciler
 */

import { NextResponse } from 'next/server';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { listLinkedStudentsForParent } from '@/lib/parent/listLinkedStudents';

async function getParentChildrenHandler(): Promise<NextResponse> {
  const session = await requireSession();
  const userId = getSessionUserId(session);
  const students = await listLinkedStudentsForParent(userId);

  return NextResponse.json({
    success: true,
    data: { students },
  });
}

export const GET = asyncHandler(getParentChildrenHandler);
