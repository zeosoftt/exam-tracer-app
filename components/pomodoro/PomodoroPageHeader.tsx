'use client';

import Link from 'next/link';
import { ArrowLeft, Timer } from 'lucide-react';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';

export function PomodoroPageHeader() {
  return (
    <header className="shrink-0 border-b border-stone-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/90">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-stone-700 transition-colors hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Geri</span>
          </Link>
          <div className="flex items-center gap-2">
            <Timer className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden />
            <span className="text-xl font-bold text-stone-900 dark:text-stone-100">Pomodoro</span>
          </div>
          <div className="flex w-20 justify-end">
            <ThemeToggleCompact />
          </div>
        </div>
      </div>
    </header>
  );
}
