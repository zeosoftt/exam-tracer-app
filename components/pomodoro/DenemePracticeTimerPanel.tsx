'use client';

import { ClipboardList, Pause, Play, RotateCcw } from 'lucide-react';
import { DENEME_PRESETS } from '@/components/pomodoro/pomodoroConstants';
import type { PomodoroPageState } from '@/components/pomodoro/hooks/usePomodoroPage';

type DenemePracticeTimerPanelProps = Pick<
  PomodoroPageState,
  | 'denemeRunning'
  | 'denemeRemainingSec'
  | 'denemeInitialSeconds'
  | 'denemeCustomMinutes'
  | 'setDenemeCustomMinutes'
  | 'denemeProgress'
  | 'applyDenemePreset'
  | 'applyDenemeCustom'
  | 'toggleDeneme'
  | 'resetDeneme'
  | 'formatDenemeClock'
>;

export function DenemePracticeTimerPanel({
  denemeRunning,
  denemeRemainingSec,
  denemeInitialSeconds,
  denemeCustomMinutes,
  setDenemeCustomMinutes,
  denemeProgress,
  applyDenemePreset,
  applyDenemeCustom,
  toggleDeneme,
  resetDeneme,
  formatDenemeClock,
}: DenemePracticeTimerPanelProps) {
  return (
    <section
      className="border-t border-violet-100/80 bg-gradient-to-br from-violet-50/50 via-white to-indigo-50/30 p-5 dark:border-violet-900/30 dark:from-violet-950/40 dark:via-stone-900 dark:to-indigo-950/30 sm:p-7 lg:border-t-0"
      aria-label="Deneme süresi sayacı"
    >
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
          <ClipboardList className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 sm:text-xl">Deneme sayacı</h2>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Kendi denemeniz için geri sayım. Pomodoro ile bağımsız; süre dolunca ses açıksa uyarı çalar.
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {DENEME_PRESETS.map(({ minutes, label }) => (
          <button
            key={minutes}
            type="button"
            disabled={denemeRunning}
            onClick={() => applyDenemePreset(minutes)}
            className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm font-semibold text-violet-900 shadow-sm transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-800 dark:bg-stone-800 dark:text-violet-200 dark:hover:bg-violet-950/40"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm text-stone-600 dark:text-stone-400">
          <span className="font-medium text-stone-700 dark:text-stone-300">Özel süre (dk)</span>
          <input
            type="number"
            min={1}
            max={480}
            placeholder="Örn. 100"
            disabled={denemeRunning}
            value={denemeCustomMinutes}
            onChange={(e) => setDenemeCustomMinutes(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-stone-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:focus:ring-violet-900/40"
          />
        </label>
        <button
          type="button"
          disabled={denemeRunning}
          onClick={applyDenemeCustom}
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50 sm:shrink-0"
        >
          Uygula
        </button>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative mb-5 h-56 w-56 sm:h-64 sm:w-64">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 320 320">
            <circle
              cx="160"
              cy="160"
              r="132"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              className="text-violet-100 dark:text-violet-900/40"
            />
            <circle
              cx="160"
              cy="160"
              r="132"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 132}`}
              strokeDashoffset={`${2 * Math.PI * 132 * (1 - denemeProgress / 100)}`}
              className="text-violet-600 transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tabular-nums text-violet-950 dark:text-violet-100 sm:text-5xl">
              {formatDenemeClock(denemeRemainingSec)}
            </span>
            <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-violet-700/80 dark:text-violet-300/90">
              {denemeRunning ? 'Deneme sürüyor' : denemeRemainingSec === 0 ? 'Süre doldu' : 'Hazır'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={toggleDeneme}
            disabled={denemeRemainingSec === 0}
            className="flex items-center gap-2 rounded-2xl bg-violet-600 px-7 py-3.5 font-bold text-white shadow-lg transition hover:bg-violet-700 disabled:pointer-events-none disabled:opacity-40"
          >
            {denemeRunning ? (
              <>
                <Pause className="h-5 w-5" />
                Duraklat
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Başlat
              </>
            )}
          </button>
          <button
            type="button"
            onClick={resetDeneme}
            disabled={!denemeRunning && denemeRemainingSec === denemeInitialSeconds}
            className="flex items-center gap-2 rounded-2xl border-2 border-stone-200 bg-white px-7 py-3.5 font-bold text-stone-700 shadow-md transition hover:bg-stone-50 disabled:opacity-40 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
          >
            <RotateCcw className="h-5 w-5" />
            Sıfırla
          </button>
        </div>
      </div>
    </section>
  );
}
