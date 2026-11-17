/**
 * Dashboard Page
 * İskelet hemen akar (Suspense); istatistikler sunucuda hesaplanıp ilk HTML ile gelir.
 */

import { Suspense } from 'react';
import { requirePageSession, redirectIfSetupWizardIncomplete } from '@/lib/auth/pageSession';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';
import { userCanViewParentChildrenPanel } from '@/lib/parent/canViewParentChildrenPanel';
import { loadDashboardHomeData } from '@/lib/services/dashboard/loadDashboardHomeData';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

async function DashboardHome() {
  const session = await requirePageSession();
  const [, showParentChildrenPanel, initialData] = await Promise.all([
    redirectIfSetupWizardIncomplete(session),
    userCanViewParentChildrenPanel(session.user.id),
    loadDashboardHomeData(session),
  ]);

  return (
    <DashboardContent
      user={session.user}
      showParentChildrenPanel={showParentChildrenPanel}
      initialData={initialData}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<RouteShellSkeleton />}>
      <DashboardHome />
    </Suspense>
  );
}
