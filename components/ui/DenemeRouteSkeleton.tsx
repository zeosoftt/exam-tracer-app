/**
 * Deneme sayfası route iskeleti — gerçek layout ile eşleşir (CLS azaltma).
 */

export function DenemeRouteSkeleton() {
  return (
    <div
      className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100"
      role="status"
      aria-busy="true"
      aria-label="Deneme takibi yükleniyor"
    >
      <div className="h-14 animate-pulse border-b border-stone-200 bg-white/90 sm:h-16 dark:border-stone-800 dark:bg-stone-950/90" />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 h-5 w-full max-w-lg animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
        <div className="mb-6 min-h-[9.5rem] animate-pulse rounded-2xl border border-stone-200/60 bg-white/60 dark:border-stone-700/60 dark:bg-stone-900/40" />
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="h-7 w-40 animate-pulse rounded-lg bg-stone-200 dark:bg-stone-800" />
          <div className="h-10 w-36 animate-pulse rounded-xl bg-stone-200 dark:bg-stone-800" />
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-stone-200/60 bg-white/60 dark:border-stone-700/60 dark:bg-stone-900/40"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
