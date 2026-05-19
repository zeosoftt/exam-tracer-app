/** Kullanıcı rolüne göre sınav listesi filtresi (DRY). */

export function buildExamWhereForUser(
  userRole: string | undefined,
  userId: string,
  institutionId: string | null | undefined,
): {
  deletedAt: null;
  examAssignments?: {
    some: {
      OR: Array<{ userId?: string; institutionId?: string | null }>;
      deletedAt: null;
    };
  };
} {
  const where: {
    deletedAt: null;
    examAssignments?: {
      some: {
        OR: Array<{ userId?: string; institutionId?: string | null }>;
        deletedAt: null;
      };
    };
  } = { deletedAt: null };

  if (userRole !== 'ADMIN') {
    where.examAssignments = {
      some: {
        OR: [{ userId }, { institutionId }],
        deletedAt: null,
      },
    };
  }

  return where;
}
