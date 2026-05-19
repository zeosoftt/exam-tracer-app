'use client';

import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import type { PomodoroPageState } from '@/components/pomodoro/hooks/usePomodoroPage';

type PomodoroTimerPanelProps = Pick<
  PomodoroPageState,
  | 'isBreak'
  | 'isActive'
  | 'progress'
  | 'displayMinutes'
  | 'displaySeconds'
  | 'formatTime'
  | 'handleStartPause'
  | 'handleReset'
  | 'soundEnabled'
  | 'toggleSound'
>;

export function PomodoroTimerPanel({
  isBreak,
  isActive,
  progress,
  displayMinutes,
  displaySeconds,
  formatTime,
  handleStartPause,
  handleReset,
  soundEnabled,
  toggleSound,
}: PomodoroTimerPanelProps) {
  return (
    <div className="p-5 sm:p-7">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-extrabold text-stone-900 dark:text-stone-100 sm:text-3xl">
          Odaklı çalışma
        </h1>
        <p className="mt-1 text-stone-600 dark:text-stone-400">{isBreak ? 'Mola zamanı! 🎉' : 'Çalışma zamanı!'}</p>
      </div>

      <div className="mb-6 flex justify-center">
        <div className="relative h-64 w-64 sm:h-72 sm:w-72">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 320 320">
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-stone-200 dark:text-stone-700"
            />
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 140}`}
              strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
              className={`transition-all duration-1000 ${isBreak ? 'text-accent-500' : 'text-primary-600'}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className={`text-5xl font-bold tabular-nums sm:text-6xl ${isBreak ? 'text-accent-600' : 'text-primary-600'}`}
            >
              {formatTime(displayMinutes, displaySeconds)}
            </div>
            <div className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
              {isBreak ? 'Mola' : 'Çalışma'}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => void handleStartPause()}
          className={`flex items-center gap-2 rounded-2xl px-7 py-3.5 font-bold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl ${
            isBreak
              ? 'bg-gradient-to-r from-pink-500 to-pink-600'
              : 'bg-gradient-to-r from-primary-500 to-primary-600'
          }`}
        >
          {isActive ? (
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
          onClick={handleReset}
          className="flex items-center gap-2 rounded-2xl border-2 border-stone-200 bg-white px-7 py-3.5 font-bold text-stone-700 shadow-md transition hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
        >
          <RotateCcw className="h-5 w-5" />
          Sıfırla
        </button>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={toggleSound}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            soundEnabled
              ? 'text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/40'
              : 'text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800'
          }`}
          title={soundEnabled ? 'Süre bitince ses çalar' : 'Ses kapalı'}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          <span>{soundEnabled ? 'Ses açık' : 'Ses kapalı'}</span>
        </button>
      </div>
    </div>
  );
}
