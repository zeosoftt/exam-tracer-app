import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type SectionIconHeaderProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  iconWrapperClassName?: string;
  titleClassName?: string;
  className?: string;
};

export function SectionIconHeader({
  icon,
  title,
  description,
  iconWrapperClassName = 'rounded-xl bg-stone-100 dark:bg-stone-800',
  titleClassName = 'font-display text-base font-bold sm:text-lg',
  className,
}: SectionIconHeaderProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center', iconWrapperClassName)}>{icon}</div>
      <div>
        <h2 className={cn('text-stone-900 dark:text-stone-100', titleClassName)}>{title}</h2>
        {description ? <p className="text-xs text-stone-500 dark:text-stone-400 sm:text-sm">{description}</p> : null}
      </div>
    </div>
  );
}
