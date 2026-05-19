'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type QuickLinkAccent = 'primary' | 'accent' | 'violet' | 'stone';

const accentMap: Record<
  QuickLinkAccent,
  { icon: string; iconHover: string; titleHover: string; borderHover: string }
> = {
  primary: {
    icon: 'bg-primary-100 text-primary-700 group-hover:bg-primary-600 group-hover:text-white',
    iconHover: 'group-hover:text-primary-600 dark:group-hover:text-primary-400',
    titleHover: 'group-hover:text-primary-700 dark:group-hover:text-primary-400',
    borderHover: 'hover:border-primary-300 dark:hover:border-primary-700',
  },
  accent: {
    icon: 'bg-accent-100 text-accent-700 group-hover:bg-accent-500 group-hover:text-white',
    iconHover: 'group-hover:text-accent-600 dark:group-hover:text-accent-400',
    titleHover: 'group-hover:text-accent-700 dark:group-hover:text-accent-400',
    borderHover: 'hover:border-accent-300 dark:hover:border-accent-700',
  },
  violet: {
    icon: 'bg-violet-100 text-violet-700 group-hover:bg-violet-600 group-hover:text-white',
    iconHover: 'group-hover:text-violet-600 dark:group-hover:text-violet-400',
    titleHover: 'group-hover:text-violet-700 dark:group-hover:text-violet-400',
    borderHover: 'hover:border-violet-300 dark:hover:border-violet-700',
  },
  stone: {
    icon: 'bg-stone-100 text-stone-700 group-hover:bg-stone-800 group-hover:text-white',
    iconHover: 'group-hover:text-stone-600 dark:group-hover:text-stone-400',
    titleHover: 'group-hover:text-stone-800 dark:group-hover:text-stone-200',
    borderHover: 'hover:border-stone-400 dark:hover:border-stone-600',
  },
};

type QuickLinkCardProps = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  accent?: QuickLinkAccent;
  className?: string;
};

export function QuickLinkCard({ href, title, description, icon, accent = 'primary', className }: QuickLinkCardProps) {
  const styles = accentMap[accent];

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-soft transition-colors duration-200 dark:border-stone-800 dark:bg-stone-900/80 sm:min-h-[7.5rem] sm:p-5',
        styles.borderHover,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl transition-colors', styles.icon)}>
          {icon}
        </span>
        <ArrowUpRight
          className={cn(
            'h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-stone-600',
            styles.iconHover,
          )}
          aria-hidden
        />
      </div>
      <span className={cn('font-display font-semibold text-stone-900 dark:text-stone-100', styles.titleHover)}>{title}</span>
      <span className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">{description}</span>
    </Link>
  );
}
