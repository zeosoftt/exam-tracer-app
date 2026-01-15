/**
 * Dashboard Detail Page
 * Detaylı dashboard ekranı - tüm istatistikler ve analizler
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { DashboardDetailContent } from '@/components/dashboard/DashboardDetailContent';

export default async function DashboardDetailPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return <DashboardDetailContent user={session.user} />;
}
