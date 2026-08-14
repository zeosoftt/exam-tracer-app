import 'server-only';

import { prisma } from '@/lib/db/prisma';
import type { SessionEngagementStats } from '@/lib/marketing/sessionEngagementTypes';

export type { SessionEngagementStats } from '@/lib/marketing/sessionEngagementTypes';

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

async function fetchSessionsSince(since: Date) {
  return prisma.appSession.findMany({
    where: { endedAt: { gte: since } },
    select: { durationSeconds: true, userId: true },
  });
}

export async function getSessionEngagementStats(): Promise<SessionEngagementStats> {
  const empty: SessionEngagementStats = {
    sessionsLast7Days: 0,
    sessionsLast30Days: 0,
    avgDurationSeconds7d: 0,
    avgDurationSeconds30d: 0,
    medianDurationSeconds7d: 0,
    totalDurationMinutes7d: 0,
    uniqueUsersLast7Days: 0,
  };

  try {
    const since7 = daysAgo(7);
    const since30 = daysAgo(30);

    const [sessions7d, sessions30d] = await Promise.all([
      fetchSessionsSince(since7),
      fetchSessionsSince(since30),
    ]);

    const durations7d = sessions7d.map((s) => s.durationSeconds);
    const durations30d = sessions30d.map((s) => s.durationSeconds);

    return {
      sessionsLast7Days: sessions7d.length,
      sessionsLast30Days: sessions30d.length,
      avgDurationSeconds7d: average(durations7d),
      avgDurationSeconds30d: average(durations30d),
      medianDurationSeconds7d: median(durations7d),
      totalDurationMinutes7d: Math.round(durations7d.reduce((sum, v) => sum + v, 0) / 60),
      uniqueUsersLast7Days: new Set(sessions7d.map((s) => s.userId).filter(Boolean)).size,
    };
  } catch {
    return empty;
  }
}
