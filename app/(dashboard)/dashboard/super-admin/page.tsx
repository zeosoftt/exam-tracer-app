/**
 * Super Admin Panel
 * Sadece ADMIN rolüne sahip kullanıcılar erişebilir.
 */

import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { USER_ROLES } from '@/config/constants';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const SuperAdminPanel = dynamic(
  () => import('@/components/super-admin/SuperAdminPanel').then((m) => m.SuperAdminPanel),
  { loading: () => <RouteShellSkeleton /> },
);

export default async function SuperAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  if (session.user?.role !== USER_ROLES.ADMIN) {
    redirect('/dashboard');
  }

  return <SuperAdminPanel />;
}
