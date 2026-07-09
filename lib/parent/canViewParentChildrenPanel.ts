/**
 * Veli paneli — yalnızca kurumsal org'da PARENT rolü + bağlı öğrenci olan kullanıcılar.
 * Bireysel (kişisel org) kullanıcılar bu alanı görmez.
 */

import { prisma } from '@/lib/db/prisma';
import { ensureProductionTablesOnce } from '@/lib/db/ensureProductionTables';
import { parentHasLinkedStudents } from '@/lib/parent/listLinkedStudents';

const PARENT_ROLE_CODE = 'SYSTEM_ROLE_PARENT';

/** Kurumsal (kişisel olmayan) org'da aktif veli üyeliği var mı? */
export async function userHasInstitutionalParentRole(userId: string): Promise<boolean> {
  await ensureProductionTablesOnce(prisma);

  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      isActive: true,
      deletedAt: null,
      role: { code: PARENT_ROLE_CODE },
      organization: {
        isPersonal: false,
        isActive: true,
        deletedAt: null,
      },
    },
    select: { id: true },
  });

  return Boolean(membership);
}

/** Dashboard'da "Bağlı öğrenciler" kartı gösterilsin mi? */
export async function userCanViewParentChildrenPanel(userId: string): Promise<boolean> {
  if (!(await userHasInstitutionalParentRole(userId))) {
    return false;
  }
  return parentHasLinkedStudents(userId);
}
