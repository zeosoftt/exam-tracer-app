import { SkeletonRows } from '@/components/ui';

export function PomodoroSidebarSkeleton({ rows }: { rows: number }) {
  return <SkeletonRows rows={rows} />;
}
