/**
 * Sınav & İçerik Yönetimi
 * Sınav → Bölüm → Ders → Konu CRUD. Sadece ADMIN.
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { USER_ROLES } from '@/config/constants';
import { ExamContentManager } from '@/components/super-admin/ExamContentManager';

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
