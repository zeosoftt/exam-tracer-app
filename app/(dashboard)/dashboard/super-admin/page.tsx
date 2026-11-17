/**
 * Super Admin — Özet
 */

import dynamic from 'next/dynamic';
import { AdminPageSkeleton } from '@/components/super-admin/layout/AdminLoading';

const SuperAdminOverview = dynamic(
  () =>
    import('@/components/super-admin/SuperAdminPanel').then((m) => m.SuperAdminOverview),
  { loading: () => <AdminPageSkeleton /> },
);

export default function SuperAdminPage() {
  return <SuperAdminOverview />;
}
