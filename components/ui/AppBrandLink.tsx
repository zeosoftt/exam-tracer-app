'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type AppBrandLinkProps = {
  variant?: 'solid' | 'gradient';
  className?: string;
};

export function AppBrandLink({ variant = 'solid', className }: AppBrandLinkProps) {
  return (
    <Link href="/dashboard" className={cn('group flex min-w-0 items-center gap-1.5 sm:gap-2', className)}>
      {variant === 'solid' ? (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white sm:h-10 sm:w-10">
          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      ) : (
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 opacity-75 blur transition group-hover:opacity-100" />
          <BookOpen className="relative h-5 w-5 text-primary-600 dark:text-primary-400 sm:h-6 sm:w-6" />
        </div>
      )}
      <span className="truncate font-display text-base font-bold text-stone-900 dark:text-stone-100 sm:text-lg sm:text-xl">
        The Goal Lab
      </span>
    </Link>
  );
}
