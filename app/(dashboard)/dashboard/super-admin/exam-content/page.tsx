/**
 * Sınav & İçerik Yönetimi
 * Sınav → Bölüm → Ders → Konu CRUD. Sadece ADMIN.
 */

import dynamic from 'next/dynamic';
import { AdminPageSkeleton } from '@/components/super-admin/layout/AdminLoading';

const ExamContentManager = dynamic(
  () =>
    import('@/components/super-admin/ExamContentManager').then((m) => m.ExamContentManager),
  { loading: () => <AdminPageSkeleton /> },
);

export default function ExamContentPage() {
  // Auth: layout.tsx → requireAdminPageSession
  return <ExamContentManager />;
}
