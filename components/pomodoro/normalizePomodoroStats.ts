import type { PomodoroStats } from '@/lib/client-api/pomodoroClient';

export function normalizePomodoroStats(stats: PomodoroStats): PomodoroStats {
  return {
    ...stats,
    todayStudyMinutes: stats.todayStudyMinutes ?? Math.round(stats.todayStudyHours * 60),
    weekStudyMinutes: stats.weekStudyMinutes ?? Math.round(stats.weekStudyHours * 60),
    totalStudyMinutes: stats.totalStudyMinutes ?? Math.round(stats.totalStudyHours * 60),
  };
}
