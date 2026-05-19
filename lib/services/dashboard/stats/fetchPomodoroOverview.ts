import type { StatsDb } from '@/lib/services/dashboard/stats/types';

export async function fetchPomodoroOverview(db: StatsDb, userId: string) {
  const studyHoursStats = await db.pomodoroSession.aggregate({
    where: {
      userId,
      deletedAt: null,
      completed: true,
      isBreak: false,
    },
    _sum: { duration: true },
    _count: true,
  });

  const totalStudyHours = studyHoursStats._sum.duration
    ? Math.round((studyHoursStats._sum.duration / 60) * 10) / 10
    : 0;
  const totalPomodoroSessions = studyHoursStats._count || 0;

  return { totalStudyHours, totalPomodoroSessions };
}
