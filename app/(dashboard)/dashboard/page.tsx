/**
 * Dashboard Page
 * Main dashboard with exam overview and progress
 */

import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const DashboardContent = dynamic(
  () =>
    import('@/components/dashboard/DashboardContent').then((m) => m.DashboardContent),
  { loading: () => <RouteShellSkeleton /> },
);

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return <DashboardContent user={session.user} />;
}
