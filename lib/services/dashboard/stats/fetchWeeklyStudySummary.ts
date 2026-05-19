import type { StatsDb, WeeklyStudyDay } from '@/lib/services/dashboard/stats/types';

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function buildEmptyWeeklySummary(dailyGoalMinutes: number): WeeklyStudyDay[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysToMonday);
  monday.setUTCHours(0, 0, 0, 0);

  const weeklyStudySummary: WeeklyStudyDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    weeklyStudySummary.push({
      date: dateStr,
      dayName: DAY_NAMES[i],
      minutesStudied: 0,
      goalMinutes: dailyGoalMinutes,
      completed: false,
      hoursStudied: 0,
      dayIndex: i,
    });
  }
  return weeklyStudySummary;
}

export async function fetchWeeklyStudySummary(
  db: StatsDb,
  userId: string,
  dailyStudyHours: number | null | undefined,
  isCoreScope: boolean,
): Promise<WeeklyStudyDay[]> {
  const dailyGoalMinutes = (dailyStudyHours ?? 0) * 60;
  const weeklyStudySummary = buildEmptyWeeklySummary(dailyGoalMinutes);

  if (isCoreScope || dailyGoalMinutes <= 0) {
    return weeklyStudySummary;
  }

  const firstDay = new Date(weeklyStudySummary[0].date + 'T00:00:00.000Z');
  const lastDayEnd = new Date(weeklyStudySummary[6].date + 'T23:59:59.999Z');
  const sessions = await db.pomodoroSession.findMany({
    where: {
      userId,
      deletedAt: null,
      completed: true,
      isBreak: false,
      startedAt: {
        gte: firstDay,
        lte: lastDayEnd,
      },
    },
    select: { startedAt: true, duration: true },
  });

  for (const s of sessions) {
    const dateStr = new Date(s.startedAt).toISOString().slice(0, 10);
    const row = weeklyStudySummary.find((r) => r.date === dateStr);
    if (row) {
      row.minutesStudied += s.duration;
      row.hoursStudied = Math.round((row.minutesStudied / 60) * 10) / 10;
      row.completed = row.minutesStudied >= dailyGoalMinutes;
    }
  }

  return weeklyStudySummary;
}
