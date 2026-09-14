import dynamic from 'next/dynamic';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const AdminAuditPage = dynamic(
  () => import('@/components/super-admin/AdminAuditPage').then((m) => m.AdminAuditPage),
  { loading: () => <RouteShellSkeleton /> },
);

export default function AuditPage() {
  return <AdminAuditPage />;
}
