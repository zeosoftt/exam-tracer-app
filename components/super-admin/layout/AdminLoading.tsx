import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Route chunk'ı yüklenirken AdminShell içinde gösterilen içerik iskeleti.
 * (RouteShellSkeleton tam sayfa + kendi header'ını çizer; admin shell'in
 * içinde ikinci bir sahte header oluşturduğu için burada kullanılmaz.)
 */
export function AdminPageSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-busy="true" aria-label="Yükleniyor">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

/** Tablo gövdesi için satır iskeleti (Card içinde p-0 ile kullanılır). */
export function AdminTableSkeleton({
  rows = 6,
  columns = 5,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('divide-y', className)} role="status" aria-busy="true" aria-label="Yükleniyor">
      <div className="flex gap-4 px-4 py-3">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {[...Array(rows)].map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-4">
          {[...Array(columns)].map((_, c) => (
            <Skeleton key={c} className={cn('h-4 flex-1', c === 0 && 'max-w-[40%]')} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Form alanları için iskelet (ayar kartları). */
export function AdminFormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-5" role="status" aria-busy="true" aria-label="Yükleniyor">
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
