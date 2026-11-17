import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  description?: string;
  /** Sağ tarafa hizalanan aksiyonlar (ör. "Yeni sınav") */
  actions?: ReactNode;
  className?: string;
};

/**
 * Admin sayfalarının tek tip başlık bloğu.
 * Shell header breadcrumb gösterir; sayfanın tek <h1>'i burasıdır.
 */
export function AdminPageHeader({ title, description, actions, className }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
