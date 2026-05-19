export function PomodoroSidebarSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
      ))}
    </div>
  );
}
