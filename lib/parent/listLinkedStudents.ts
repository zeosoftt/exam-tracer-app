/**
 * Veli–öğrenci bağlantıları listesi.
 */

import { prisma } from '@/lib/db/prisma';
import { ensureProductionTablesOnce } from '@/lib/db/ensureProductionTables';
import type { LinkedStudentSummary } from '@/lib/parent/linkedStudentTypes';

export type { LinkedStudentSummary } from '@/lib/parent/linkedStudentTypes';

export async function listLinkedStudentsForParent(
  parentUserId: string,
): Promise<LinkedStudentSummary[]> {
  await ensureProductionTablesOnce(prisma);

  const links = await prisma.parentStudentLink.findMany({
    where: {
      parentUserId,
      deletedAt: null,
      OR: [
        { organizationId: null },
        { organization: { isPersonal: false, deletedAt: null } },
      ],
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          isActive: true,
          deletedAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const activeLinks = links.filter(
    (l) => l.student && l.student.deletedAt === null && l.student.isActive,
  );

  if (activeLinks.length === 0) return [];

  const studentIds = activeLinks.map((l) => l.student.id);

  const progressCounts = await prisma.userProgress.groupBy({
    by: ['userId', 'status'],
    where: { userId: { in: studentIds }, deletedAt: null },
    _count: { _all: true },
  });

  const totals = await prisma.userProgress.groupBy({
    by: ['userId'],
    where: { userId: { in: studentIds }, deletedAt: null },
    _count: { _all: true },
  });

  const completedByUser = new Map<string, number>();
  for (const row of progressCounts) {
    if (row.status === 'COMPLETED') {
      completedByUser.set(row.userId, row._count._all);
    }
  }

  const totalByUser = new Map(totals.map((t) => [t.userId, t._count._all]));

  return activeLinks.map((l) => ({
    id: l.student.id,
    firstName: l.student.firstName,
    lastName: l.student.lastName,
    email: l.student.email,
    organizationId: l.organizationId,
    completedTopics: completedByUser.get(l.student.id) ?? 0,
    totalTopics: totalByUser.get(l.student.id) ?? 0,
  }));
}

export async function parentHasLinkedStudents(parentUserId: string): Promise<boolean> {
  try {
    const count = await prisma.parentStudentLink.count({
      where: {
        parentUserId,
        deletedAt: null,
        OR: [
          { organizationId: null },
          { organization: { isPersonal: false, deletedAt: null } },
        ],
      },
    });
    return count > 0;
  } catch {
    return false;
  }
}
