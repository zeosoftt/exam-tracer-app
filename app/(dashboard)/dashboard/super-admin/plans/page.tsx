/**
 * Planlar & Abonelikler
 * Plan listesi, kullanıcı dağılımı. Sadece ADMIN.
 */

import dynamic from 'next/dynamic';
import { AdminPageSkeleton } from '@/components/super-admin/layout/AdminLoading';

const PlansContent = dynamic(
  () => import('@/components/super-admin/PlansContent').then((m) => m.PlansContent),
  { loading: () => <AdminPageSkeleton /> },
);

export default function PlansPage() {
  // Auth: layout.tsx → requireAdminPageSession
  return <PlansContent />;
}
