/** Kullanıcı rolüne göre sınav listesi filtresi (DRY). */

export function buildExamWhereForUser(
  userRole: string | undefined,
  userId: string,
  _institutionId: string | null | undefined,
): {
  deletedAt: null;
  examAssignments?: {
    some: {
      userId: string;
      deletedAt: null;
    };
  };
} {
  const where: {
    deletedAt: null;
    examAssignments?: {
      some: {
        userId: string;
        deletedAt: null;
      };
    };
  } = { deletedAt: null };

  if (userRole !== 'ADMIN') {
    where.examAssignments = {
      some: {
        userId,
        deletedAt: null,
      },
    };
  }

  return where;
}
