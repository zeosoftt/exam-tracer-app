'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { CircularProgressRing, TimerControlButtons } from '@/components/ui';
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
        <CircularProgressRing
          progress={progress}
          progressClassName={`transition-all duration-1000 ${isBreak ? 'text-accent-500' : 'text-primary-600'}`}
        >
          <div
            className={`text-5xl font-bold tabular-nums sm:text-6xl ${isBreak ? 'text-accent-600' : 'text-primary-600'}`}
          >
            {formatTime(displayMinutes, displaySeconds)}
          </div>
          <div className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
            {isBreak ? 'Mola' : 'Çalışma'}
          </div>
        </CircularProgressRing>
      </div>

      <TimerControlButtons
        className="mb-6"
        isRunning={isActive}
        onToggle={() => void handleStartPause()}
        onReset={handleReset}
        startVariant={isBreak ? 'pink' : 'primary'}
      />

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
