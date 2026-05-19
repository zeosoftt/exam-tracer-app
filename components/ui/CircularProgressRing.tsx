'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type CircularProgressRingProps = {
  progress: number;
  radius?: number;
  strokeWidth?: number;
  sizeClassName?: string;
  trackClassName?: string;
  progressClassName?: string;
  children: ReactNode;
};

export function CircularProgressRing({
  progress,
  radius = 140,
  strokeWidth = 8,
  sizeClassName = 'h-64 w-64 sm:h-72 sm:w-72',
  trackClassName = 'text-stone-200 dark:text-stone-700',
  progressClassName = 'text-primary-600 transition-all duration-1000',
  children,
}: CircularProgressRingProps) {
  const center = 160;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn('relative', sizeClassName)}>
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 320 320">
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className={trackClassName}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${circumference * (1 - clamped / 100)}`}
          className={progressClassName}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
