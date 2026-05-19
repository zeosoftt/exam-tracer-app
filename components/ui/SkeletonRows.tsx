export function SkeletonRows({ rows, className = 'h-20' }: { rows: number; className?: string }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className={`animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800 ${className}`} />
      ))}
    </div>
  );
}
