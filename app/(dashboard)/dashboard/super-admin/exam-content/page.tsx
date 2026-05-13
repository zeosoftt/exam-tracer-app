/**
 * Sınav & İçerik Yönetimi
 * Sınav → Bölüm → Ders → Konu CRUD. Sadece ADMIN.
 */

import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { USER_ROLES } from '@/config/constants';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const ExamContentManager = dynamic(
  () =>
    import('@/components/super-admin/ExamContentManager').then((m) => m.ExamContentManager),
  { loading: () => <RouteShellSkeleton /> },
);

export default async function ExamContentPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  if (session.user?.role !== USER_ROLES.ADMIN) {
    redirect('/dashboard');
  }

  return <ExamContentManager />;
}
