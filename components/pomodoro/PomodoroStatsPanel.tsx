import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { PanelCard } from '@/components/ui';
import {
  describeStatPeriod,
  formatStudyDuration,
} from '@/lib/pomodoro/pomodoroDisplay';

export interface PomodoroStatsData {
  totalSessions: number;
  totalStudyMinutes: number;
  todaySessions: number;
  todayStudyMinutes: number;
  weekSessions: number;
  weekStudyMinutes: number;
}

const PERIODS = [
  { key: 'today' as const, icon: Clock, accent: 'primary' },
  { key: 'week' as const, icon: Calendar, accent: 'primary' },
  { key: 'total' as const, icon: TrendingUp, accent: 'green' },
] as const;

function periodData(stats: PomodoroStatsData, key: (typeof PERIODS)[number]['key']) {
  switch (key) {
    case 'today':
      return { sessions: stats.todaySessions, studyMinutes: stats.todayStudyMinutes };
    case 'week':
      return { sessions: stats.weekSessions, studyMinutes: stats.weekStudyMinutes };
    case 'total':
      return { sessions: stats.totalSessions, studyMinutes: stats.totalStudyMinutes };
  }
}

export function PomodoroStatsPanel({
  stats,
  compact = false,
  className = '',
}: {
  stats: PomodoroStatsData;
  compact?: boolean;
  className?: string;
}) {
  return (
    <PanelCard padding={compact ? 'sm' : 'md'} className={className}>
      <div className="mb-1 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">İstatistikler</h2>
      </div>
      {!compact && (
        <p className="mb-4 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
          Yalnızca <span className="font-medium text-stone-700 dark:text-stone-300">tamamlanan çalışma</span>{' '}
          oturumları sayılır. Molalar ve yarım kalan oturumlar dahil değildir.
        </p>
      )}

      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        {PERIODS.map(({ key, icon: Icon, accent }) => {
          const data = periodData(stats, key);
          const copy = describeStatPeriod(key, data);
          const isGreen = accent === 'green';

          return (
            <div
              key={key}
              className={`rounded-xl border ${
                compact ? 'p-2.5' : 'p-4'
              } ${
                isGreen
                  ? 'border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-900/40 dark:from-green-950/30 dark:to-emerald-950/20'
                  : 'border-primary-100 bg-primary-50/80 dark:border-primary-900/40 dark:bg-primary-950/25'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {copy.title}
                  </div>
                  <div
                    className={`mt-0.5 font-bold tabular-nums ${
                      compact ? 'text-lg' : 'text-2xl'
                    } ${
                      isGreen ? 'text-green-600 dark:text-green-400' : 'text-primary-600 dark:text-primary-400'
                    }`}
                  >
                    {formatStudyDuration(data.studyMinutes)}
                  </div>
                  {!compact && (
                    <>
                      <p className="mt-1 text-sm font-medium text-stone-800 dark:text-stone-200">{copy.subtitle}</p>
                      <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{copy.detail}</p>
                    </>
                  )}
                  {compact && (
                    <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">{copy.subtitle}</p>
                  )}
                </div>
                <div
                  className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums ${
                    isGreen
                      ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300'
                      : 'bg-primary-100 text-primary-800 dark:bg-primary-950/50 dark:text-primary-300'
                  }`}
                >
                  {data.sessions}×
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
}
