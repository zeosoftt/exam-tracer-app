'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type EmptyStateCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  iconWrapperClassName?: string;
};

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  className,
  iconWrapperClassName = 'bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-950 dark:to-primary-900',
}: EmptyStateCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-stone-100 bg-white p-8 text-center shadow-xl dark:border-stone-800 dark:bg-stone-900/90 sm:rounded-2xl sm:p-16',
        className,
      )}
    >
      <div
        className={cn(
          'mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full',
          iconWrapperClassName,
        )}
      >
        <Icon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-stone-900 dark:text-stone-100">{title}</h3>
      <p className="mx-auto max-w-md text-stone-600 dark:text-stone-400">{description}</p>
    </div>
  );
}
