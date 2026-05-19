import type { DenemeSummary, PrismaWithExamAttempt } from '@/lib/services/dashboard/stats/types';

export async function fetchDenemeSummary(
  db: PrismaWithExamAttempt,
  userId: string,
  isCoreScope: boolean,
): Promise<DenemeSummary> {
  const [denemeCount, lastDeneme, recentAttemptsRaw] = await Promise.all([
    db.examAttempt.count({ where: { userId, deletedAt: null } }),
    db.examAttempt.findFirst({
      where: { userId, deletedAt: null },
      orderBy: { attemptedAt: 'desc' },
      select: {
        attemptedAt: true,
        totalScore: true,
        netScore: true,
        exam: { select: { name: true, code: true } },
      },
    }),
    isCoreScope
      ? Promise.resolve([])
      : db.examAttempt.findMany({
          where: { userId, deletedAt: null },
          orderBy: { attemptedAt: 'desc' },
          take: 10,
          select: {
            attemptedAt: true,
            totalScore: true,
            netScore: true,
          },
        }),
  ]);

  const recentAttemptsList = (recentAttemptsRaw ?? []) as Array<{
    attemptedAt: Date;
    totalScore: unknown;
    netScore: unknown;
  }>;

  return {
    totalAttempts: denemeCount,
    lastAttemptAt: lastDeneme?.attemptedAt?.toISOString() ?? null,
    lastAttemptScore: lastDeneme?.totalScore != null ? Number(lastDeneme.totalScore) : null,
    lastAttemptNet: lastDeneme?.netScore != null ? Number(lastDeneme.netScore) : null,
    lastAttemptExamName: lastDeneme?.exam?.name ?? null,
    recentAttempts: recentAttemptsList.map((a) => ({
      attemptedAt: a.attemptedAt.toISOString(),
      totalScore: a.totalScore != null ? Number(a.totalScore) : null,
      netScore: a.netScore != null ? Number(a.netScore) : null,
    })),
  };
}
