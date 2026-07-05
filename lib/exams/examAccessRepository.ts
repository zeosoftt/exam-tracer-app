/**
 * Sınav erişim kontrolü — repository katmanı.
 */

import { prisma } from '@/lib/db/prisma';

/** Kullanıcının aktif bir sınav ataması var mı? */
export async function userHasExamAssignment(userId: string, examId: string): Promise<boolean> {
  const assignment = await prisma.examAssignment.findFirst({
    where: {
      userId,
      examId,
      deletedAt: null,
      exam: { status: 'ACTIVE', deletedAt: null },
    },
    select: { id: true },
  });
  return assignment !== null;
}
