/**
 * GET /api/super-admin/exam-content
 * Returns full tree: exams → sections → subjects → topics (deletedAt: null)
 * Sadece ADMIN rolü erişebilir.
 */

import { NextResponse } from 'next/server';
import { withAdminHandler } from '@/lib/api/withAdminHandler';
import { getExamContentTree } from '@/lib/exams/examRepository';

async function getExamContentHandler(): Promise<NextResponse> {
  const exams = await getExamContentTree();
  return NextResponse.json({
    success: true,
    data: { exams },
  });
}

export const GET = withAdminHandler(getExamContentHandler);
