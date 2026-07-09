/**
 * Sınav erişim kontrolü — repository katmanı.
 */

import { prisma } from '@/lib/db/prisma';
import {
  isAdmin,
  isInstitutionAdmin,
  type UserPermissions,
} from '@/lib/auth/permissions';

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

/** Sınav görüntüleme yetkisi — admin, kurum admini veya atanmış bireysel kullanıcı. */
export async function userCanViewExam(
  userId: string,
  examId: string,
  userPermissions: UserPermissions,
  examInstitutionId?: string | null,
): Promise<boolean> {
  if (isAdmin(userPermissions.role)) {
    return true;
  }

  if (isInstitutionAdmin(userPermissions.role)) {
    return userPermissions.institutionId === examInstitutionId;
  }

  return userHasExamAssignment(userId, examId);
}
