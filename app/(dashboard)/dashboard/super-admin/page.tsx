/**
 * Super Admin Panel
 * Sadece ADMIN rolüne sahip kullanıcılar erişebilir.
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { USER_ROLES } from '@/config/constants';
import { SuperAdminPanel } from '@/components/super-admin/SuperAdminPanel';

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
