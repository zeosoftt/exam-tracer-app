'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { AppPageHeader } from '@/components/ui/AppPageHeader';
import { BackLink } from '@/components/ui/BackLink';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';

type SubAppPageHeaderProps = {
  title: string;
  icon?: ReactNode;
  backHref?: string;
  right?: ReactNode;
  showThemeToggle?: boolean;
  className?: string;
};

export function SubAppPageHeader({
  title,
  icon,
  backHref = '/dashboard',
  right,
  showThemeToggle = true,
  className,
}: SubAppPageHeaderProps) {
  const resolvedRight =
    right !== undefined ? (
      right
    ) : showThemeToggle ? (
      <div className="flex min-w-0 justify-end">
        <ThemeToggleCompact />
      </div>
    ) : (
      <div className="w-16 shrink-0 sm:w-20" aria-hidden />
    );

  return (
    <AppPageHeader
      sticky={false}
      className={cn('border-stone-200 bg-white/90 dark:border-stone-800 dark:bg-stone-950/90', className)}
      innerClassName="px-4 sm:px-6 lg:px-8"
      left={<BackLink href={backHref} label="Geri" variant="compact" />}
      center={
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xl font-bold text-stone-900 dark:text-stone-100">{title}</span>
        </div>
      }
      right={resolvedRight}
    />
  );
}
