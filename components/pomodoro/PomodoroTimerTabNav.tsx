'use client';

import { ClipboardList, Timer } from 'lucide-react';
import type { PomodoroTimerTab } from '@/components/pomodoro/pomodoroTypes';

type PomodoroTimerTabNavProps = {
  timerTab: PomodoroTimerTab;
  onTabChange: (tab: PomodoroTimerTab) => void;
};

export function PomodoroTimerTabNav({ timerTab, onTabChange }: PomodoroTimerTabNavProps) {
  return (
    <nav
      className="flex shrink-0 gap-1 border-b border-stone-200 bg-stone-50/95 p-2 dark:border-stone-800 dark:bg-stone-950/80 lg:w-[3.75rem] lg:flex-col lg:border-b-0 lg:border-r lg:px-1 lg:py-3"
      aria-label="Zamanlayıcı modu"
    >
      <button
        type="button"
        onClick={() => onTabChange('pomodoro')}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition lg:flex-1 lg:flex-col lg:justify-center lg:gap-0 lg:px-0.5 lg:py-6 ${
          timerTab === 'pomodoro'
            ? 'bg-white text-primary-700 shadow-sm ring-1 ring-stone-200/80 dark:bg-stone-900 dark:text-primary-300 dark:ring-stone-700 lg:border-l-[3px] lg:border-l-primary-600 lg:ring-0'
            : 'text-stone-600 hover:bg-white/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/80 dark:hover:text-stone-100'
        }`}
      >
        <Timer className="h-5 w-5 shrink-0 opacity-90 lg:mb-3 lg:h-6 lg:w-6" aria-hidden />
        <span className="font-display lg:hidden">Pomodoro</span>
        <div className="hidden lg:flex lg:min-h-[5.5rem] lg:w-full lg:flex-1 lg:items-center lg:justify-center">
          <span
            className={`origin-center -rotate-90 select-none whitespace-nowrap font-display text-[10px] font-bold uppercase tracking-[0.42em] ${
              timerTab === 'pomodoro' ? 'text-primary-800 dark:text-primary-300' : 'text-stone-500 dark:text-stone-500'
            }`}
          >
            Pomodoro
          </span>
        </div>
      </button>
      <button
        type="button"
        onClick={() => onTabChange('deneme')}
        className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition lg:flex-1 lg:flex-col lg:justify-center lg:gap-0 lg:px-0.5 lg:py-6 ${
          timerTab === 'deneme'
            ? 'bg-white text-accent-800 shadow-sm ring-1 ring-stone-200/80 dark:bg-stone-900 dark:text-accent-300 dark:ring-stone-700 lg:border-l-[3px] lg:border-l-accent-600 lg:ring-0'
            : 'text-stone-600 hover:bg-white/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/80 dark:hover:text-stone-100'
        }`}
      >
        <ClipboardList className="h-5 w-5 shrink-0 opacity-90 lg:mb-3 lg:h-6 lg:w-6" aria-hidden />
        <span className="font-display lg:hidden">Deneme</span>
        <div className="hidden lg:flex lg:min-h-[4.5rem] lg:w-full lg:flex-1 lg:items-center lg:justify-center">
          <span
            className={`origin-center -rotate-90 select-none whitespace-nowrap font-display text-[10px] font-bold uppercase tracking-[0.42em] ${
              timerTab === 'deneme' ? 'text-accent-900 dark:text-accent-300' : 'text-stone-500 dark:text-stone-500'
            }`}
          >
            Deneme
          </span>
        </div>
      </button>
    </nav>
  );
}
