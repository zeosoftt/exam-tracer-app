/**
 * Super Admin — Özet
 */

import dynamic from 'next/dynamic';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const SuperAdminOverview = dynamic(
  () =>
    import('@/components/super-admin/SuperAdminPanel').then((m) => m.SuperAdminOverview),
  { loading: () => <RouteShellSkeleton /> },
);

export default function SuperAdminPage() {
  return <SuperAdminOverview />;
}
