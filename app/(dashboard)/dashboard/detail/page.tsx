/**
 * Dashboard Detail Page
 * Detaylı dashboard ekranı - tüm istatistikler ve analizler
 */

import dynamic from 'next/dynamic';
import { requirePageSession } from '@/lib/auth/pageSession';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const DashboardDetailContent = dynamic(
  () =>
    import('@/components/dashboard/DashboardDetailContent').then(
      (m) => m.DashboardDetailContent,
    ),
  { loading: () => <RouteShellSkeleton /> },
);

export default async function DashboardDetailPage() {
  const session = await requirePageSession();

  return <DashboardDetailContent user={session.user} />;
}
