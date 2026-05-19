'use client';

import { PomodoroStatsPanel } from '@/components/pomodoro/PomodoroStatsPanel';
import { PomodoroHistoryPanel } from '@/components/pomodoro/PomodoroHistoryPanel';
import { PomodoroSidebarSkeleton } from '@/components/pomodoro/PomodoroSidebarSkeleton';
import { normalizePomodoroStats } from '@/components/pomodoro/normalizePomodoroStats';
import type { PomodoroPageState } from '@/components/pomodoro/hooks/usePomodoroPage';

type PomodoroSidebarProps = Pick<PomodoroPageState, 'isLoading' | 'stats' | 'history'>;

export function PomodoroSidebar({ isLoading, stats, history }: PomodoroSidebarProps) {
  return (
    <div className="flex min-h-[16rem] flex-col gap-3 lg:col-span-1 lg:min-h-0 lg:max-h-full lg:overflow-hidden">
      {isLoading ? (
        <>
          <div className="shrink-0 rounded-2xl border border-stone-100 bg-white p-4 shadow-lg dark:border-stone-800 dark:bg-stone-900/90">
            <div className="mb-3 h-5 w-28 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
            <PomodoroSidebarSkeleton rows={3} />
          </div>
          <div className="min-h-0 flex-1 rounded-2xl border border-stone-100 bg-white p-4 shadow-lg dark:border-stone-800 dark:bg-stone-900/90">
            <div className="mb-3 h-5 w-32 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
            <PomodoroSidebarSkeleton rows={4} />
          </div>
        </>
      ) : (
        <>
          {stats ? (
            <PomodoroStatsPanel compact stats={normalizePomodoroStats(stats)} className="shrink-0" />
          ) : (
            <div className="shrink-0 rounded-2xl border border-stone-100 bg-white p-4 shadow-lg dark:border-stone-800 dark:bg-stone-900/90">
              <p className="text-sm text-stone-500 dark:text-stone-400">İstatistikler yüklenemedi.</p>
            </div>
          )}
          <PomodoroHistoryPanel sessions={history} className="min-h-0 flex-1" />
        </>
      )}
    </div>
  );
}
