import type { StatsDb } from '@/lib/services/dashboard/stats/types';

export async function fetchUserGoals(db: StatsDb, userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      targetScore: true,
      dailyStudyHours: true,
    },
  });
}
