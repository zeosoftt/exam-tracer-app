'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type BackLinkProps = {
  href: string;
  label: string;
  /** `compact` = üst bar; `page` = içerik üstü geri linki */
  variant?: 'compact' | 'page';
  className?: string;
};

export function BackLink({ href, label, variant = 'page', className }: BackLinkProps) {
  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className={cn(
          'flex items-center gap-2 text-stone-700 transition-colors hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100',
          className,
        )}
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
        <span className="font-medium">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'group mb-4 inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 sm:mb-8',
        className,
      )}
    >
      <div className="rounded-lg bg-stone-100 p-1.5 transition-colors group-hover:bg-stone-200 dark:bg-stone-800 dark:group-hover:bg-stone-700">
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </div>
      <span className="sm:inline">{label}</span>
    </Link>
  );
}
