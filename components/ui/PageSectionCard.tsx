import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { pageCardClass } from '@/lib/ui/pageStyles';

type PageSectionCardProps = {
  title: string;
  icon: ReactNode;
  iconClassName?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

/** Ayarlar ve benzeri sayfa bölüm kartı. */
export function PageSectionCard({
  title,
  icon,
  iconClassName = 'bg-primary-100 dark:bg-primary-950/60',
  description,
  children,
  className,
}: PageSectionCardProps) {
  return (
    <div className={cn(pageCardClass, className)}>
      <div className="mb-6 flex items-start gap-3">
        <div className={cn('rounded-full p-3', iconClassName)}>{icon}</div>
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 sm:text-2xl">{title}</h2>
          {description ? <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p> : null}
        </div>
      </div>
      {children}
    </div>
  );
}
