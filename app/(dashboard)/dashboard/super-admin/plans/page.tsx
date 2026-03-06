/**
 * Planlar & Abonelikler
 * Plan listesi, kullanıcı dağılımı. Sadece ADMIN.
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { USER_ROLES } from '@/config/constants';
import { PlansContent } from '@/components/super-admin/PlansContent';

export default async function PlansPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  if (session.user?.role !== USER_ROLES.ADMIN) {
    redirect('/dashboard');
  }

  return <PlansContent />;
}
