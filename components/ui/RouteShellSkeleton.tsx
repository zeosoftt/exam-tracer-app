/**
 * Ağır route chunk’ları yüklenirken gösterilen hafif iskelet (CLS ve TBT dengesi).
 */

export function RouteShellSkeleton() {
  return (
    <div
      className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100"
      role="status"
      aria-busy="true"
      aria-label="Yükleniyor"
    >
      <div className="h-14 animate-pulse border-b border-stone-200 bg-white/90 sm:h-16 dark:border-stone-800 dark:bg-stone-950/90" />
      <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6 lg:p-8">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
        <div className="h-36 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-28 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800" />
          <div className="h-28 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800" />
          <div className="h-28 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800 sm:col-span-2 lg:col-span-1" />
        </div>
      </div>
    </div>
  );
}
