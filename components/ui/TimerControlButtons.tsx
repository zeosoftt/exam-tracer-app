'use client';

import { Pause, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const resetButtonClass =
  'flex items-center gap-2 rounded-2xl border-2 border-stone-200 bg-white px-7 py-3.5 font-bold text-stone-700 shadow-md transition hover:bg-stone-50 disabled:opacity-40 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700';

type TimerControlButtonsProps = {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  startVariant?: 'primary' | 'violet' | 'pink';
  startDisabled?: boolean;
  resetDisabled?: boolean;
  className?: string;
};

const startVariants = {
  primary: 'bg-gradient-to-r from-primary-500 to-primary-600',
  violet: 'bg-violet-600 hover:bg-violet-700',
  pink: 'bg-gradient-to-r from-pink-500 to-pink-600',
};

export function TimerControlButtons({
  isRunning,
  onToggle,
  onReset,
  startVariant = 'primary',
  startDisabled = false,
  resetDisabled = false,
  className,
}: TimerControlButtonsProps) {
  return (
    <div className={cn('flex flex-wrap justify-center gap-3', className)}>
      <button
        type="button"
        onClick={onToggle}
        disabled={startDisabled}
        className={cn(
          'flex items-center gap-2 rounded-2xl px-7 py-3.5 font-bold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl disabled:pointer-events-none disabled:opacity-40',
          startVariants[startVariant],
        )}
      >
        {isRunning ? (
          <>
            <Pause className="h-5 w-5" aria-hidden />
            Duraklat
          </>
        ) : (
          <>
            <Play className="h-5 w-5" aria-hidden />
            Başlat
          </>
        )}
      </button>
      <button type="button" onClick={onReset} disabled={resetDisabled} className={resetButtonClass}>
        <RotateCcw className="h-5 w-5" aria-hidden />
        Sıfırla
      </button>
    </div>
  );
}
