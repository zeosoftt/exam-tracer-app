/**
 * Dashboard Detail Page
 * Detaylı dashboard ekranı - tüm istatistikler ve analizler
 */

import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const DashboardDetailContent = dynamic(
  () =>
    import('@/components/dashboard/DashboardDetailContent').then(
      (m) => m.DashboardDetailContent,
    ),
  { loading: () => <RouteShellSkeleton /> },
);

export default async function DashboardDetailPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return <DashboardDetailContent user={session.user} />;
}
