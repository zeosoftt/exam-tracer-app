/**
 * Dashboard Page
 * Main dashboard with exam overview and progress
 */

import dynamic from 'next/dynamic';
import { requirePageSession, redirectIfSetupWizardIncomplete } from '@/lib/auth/pageSession';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const DashboardContent = dynamic(
  () =>
    import('@/components/dashboard/DashboardContent').then((m) => m.DashboardContent),
  { loading: () => <RouteShellSkeleton /> },
);

export default async function DashboardPage() {
  const session = await requirePageSession();
  await redirectIfSetupWizardIncomplete(session);

  return <DashboardContent user={session.user} />;
}
