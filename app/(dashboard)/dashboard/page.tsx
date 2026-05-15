/**
 * Dashboard Page
 * Main dashboard with exam overview and progress
 */

import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { ensureSetupWizardColumnOnce } from '@/lib/db/ensureSetupWizardColumn';
import { isMissingSetupWizardColumnError } from '@/lib/db/setupWizardColumnSupport';
import { USER_ROLES } from '@/config/constants';
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

  const role = session.user.role ?? '';
  if (role !== USER_ROLES.ADMIN && role !== USER_ROLES.VIEWER) {
    await ensureSetupWizardColumnOnce(prisma);
    try {
      const u = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { setupWizardCompletedAt: true },
      });
      if (!u?.setupWizardCompletedAt) {
        redirect('/dashboard/setup-wizard');
      }
    } catch (e) {
      if (!isMissingSetupWizardColumnError(e)) throw e;
      // Veritabanında kolon yoksa migration uygulanmamıştır; panele izin ver.
    }
  }

  return <DashboardContent user={session.user} />;
}
