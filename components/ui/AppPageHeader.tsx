'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type AppPageHeaderProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  below?: ReactNode;
  className?: string;
  innerClassName?: string;
  sticky?: boolean;
  zIndex?: 'z-10' | 'z-20';
};

export function AppPageHeader({
  left,
  center,
  right,
  below,
  className,
  innerClassName,
  sticky = true,
  zIndex = 'z-10',
}: AppPageHeaderProps) {
  return (
    <>
      <header
        className={cn(
          sticky && 'sticky top-0',
          zIndex,
          'border-b border-stone-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/90',
          className,
        )}
      >
        <div className={cn('mx-auto max-w-7xl px-3 sm:px-6 lg:px-8', innerClassName)}>
          <div
            className={cn(
              'h-14 sm:h-16',
              center
                ? 'grid grid-cols-[1fr_auto_1fr] items-center gap-2'
                : 'flex items-center justify-between gap-2',
            )}
          >
            <div className={cn('flex min-w-0 items-center', !center && 'flex-1')}>{left}</div>
            {center ? <div className="flex items-center justify-center px-2">{center}</div> : null}
            <div
              className={cn(
                'flex items-center justify-end gap-1.5 sm:gap-2',
                center ? 'min-w-0' : 'shrink-0',
              )}
            >
              {right}
            </div>
          </div>
        </div>
      </header>
      {below}
    </>
  );
}
