'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export type StatCardAccent = 'primary' | 'violet' | 'accent' | 'teal';

const accentStyles: Record<
  StatCardAccent,
  { border: string; icon: string }
> = {
  primary: {
    border: 'border-l-primary-500 dark:border-l-primary-500',
    icon: 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400',
  },
  violet: {
    border: 'border-l-violet-500 dark:border-l-violet-500',
    icon: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  },
  accent: {
    border: 'border-l-accent-500 dark:border-l-accent-500',
    icon: 'bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300',
  },
  teal: {
    border: 'border-l-teal-600 dark:border-l-teal-500',
    icon: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  },
};

type StatCardProps = {
  accent: StatCardAccent;
  icon: ReactNode;
  label: string;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  href?: string;
  headerClassName?: string;
  className?: string;
};

export function StatCard({
  accent,
  icon,
  label,
  title,
  children,
  footer,
  href,
  headerClassName,
  className,
}: StatCardProps) {
  const styles = accentStyles[accent];
  const shellClass = cn(
    'rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/80',
    'border-l-4',
    styles.border,
    href && 'block transition-colors hover:bg-stone-50 dark:hover:bg-stone-900',
    className,
  );

  const content = (
    <>
      <div className={cn('mb-3 flex items-center gap-3 border-b border-stone-100 pb-3 dark:border-stone-800', headerClassName)}>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', styles.icon)}>{icon}</div>
        <div>
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{label}</p>
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">{title}</div>
        </div>
      </div>
      {children}
      {footer}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={shellClass}>
        {content}
      </Link>
    );
  }

  return <div className={shellClass}>{content}</div>;
}

export function StatCardGridSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('mb-8 grid gap-4 sm:mb-10 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/60"
        >
          <div className="mb-4 flex gap-3">
            <div className="h-10 w-10 rounded-lg bg-stone-200 dark:bg-stone-700" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-stone-100 dark:bg-stone-800" />
              <div className="h-8 w-16 rounded bg-stone-200 dark:bg-stone-700" />
            </div>
          </div>
          <div className="h-3 w-full max-w-[90%] rounded bg-stone-100 dark:bg-stone-800" />
        </div>
      ))}
    </div>
  );
}
