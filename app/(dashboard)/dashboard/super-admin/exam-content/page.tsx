/**
 * Sınav & İçerik Yönetimi
 * Sınav → Bölüm → Ders → Konu CRUD. Sadece ADMIN.
 */

import dynamic from 'next/dynamic';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const ExamContentManager = dynamic(
  () =>
    import('@/components/super-admin/ExamContentManager').then((m) => m.ExamContentManager),
  { loading: () => <RouteShellSkeleton /> },
);

export default function ExamContentPage() {
  // Auth: layout.tsx → requireAdminPageSession
  return <ExamContentManager />;
}
