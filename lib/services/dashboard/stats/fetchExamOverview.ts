import type { StatsDb } from '@/lib/services/dashboard/stats/types';
import { buildExamWhereForUser } from '@/lib/services/dashboard/stats/examAccess';

export async function fetchExamOverview(
  db: StatsDb,
  userId: string,
  userRole: string | undefined,
  institutionId: string | null | undefined,
) {
  const examWhere = buildExamWhereForUser(userRole, userId, institutionId);

  const [totalExams, activeExams, activeExamAssignment] = await Promise.all([
    db.exam.count({ where: examWhere }),
    db.exam.count({ where: { ...examWhere, status: 'ACTIVE' } }),
    db.examAssignment.findFirst({
      where: {
        userId,
        deletedAt: null,
        exam: { status: 'ACTIVE', deletedAt: null },
      },
      include: { exam: { select: { id: true, name: true, code: true, startDate: true } } },
      orderBy: { assignedAt: 'desc' },
    }),
  ]);

  return { totalExams, activeExams, activeExamAssignment };
}
