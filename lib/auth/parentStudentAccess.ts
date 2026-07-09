/**
 * Veli–öğrenci bağlantısı ve ilerleme görüntüleme yetkisi.
 */

import { prisma } from '@/lib/db/prisma';
import { ensureProductionTablesOnce } from '@/lib/db/ensureProductionTables';
import { hasRole } from '@/lib/auth/authorization';

export async function isParentLinkedToStudent(
  parentUserId: string,
  studentUserId: string,
  organizationId?: string | null,
): Promise<boolean> {
  if (parentUserId === studentUserId) return true;

  await ensureProductionTablesOnce(prisma);

  const link = await prisma.parentStudentLink.findFirst({
    where: {
      parentUserId,
      studentUserId,
      deletedAt: null,
      ...(organizationId ? { organizationId } : {}),
    },
    select: { id: true },
  });
  return Boolean(link);
}

/** İlerleme verisi görüntüleme — kendi kaydı, veli bağlantısı veya org yetkisi. */
export async function canViewUserProgress(
  viewerUserId: string,
  targetUserId: string,
  organizationId?: string | null,
): Promise<boolean> {
  if (viewerUserId === targetUserId) return true;

  const linked = await isParentLinkedToStudent(viewerUserId, targetUserId, organizationId);
  if (!linked) return false;

  if (organizationId) {
    const isParent = await hasRole(viewerUserId, organizationId, 'SYSTEM_ROLE_PARENT');
    if (isParent) return true;
  }

  return linked;
}

/** Öğrenci rolü kontrolü (plan limitleri vb.). */
export async function userHasStudentRole(
  userId: string,
  organizationId: string,
): Promise<boolean> {
  return hasRole(userId, organizationId, 'SYSTEM_ROLE_STUDENT');
}
