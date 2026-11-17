import dynamic from 'next/dynamic';
import { AdminPageSkeleton } from '@/components/super-admin/layout/AdminLoading';

const AdminAuditPage = dynamic(
  () => import('@/components/super-admin/AdminAuditPage').then((m) => m.AdminAuditPage),
  { loading: () => <AdminPageSkeleton /> },
);

export default function AuditPage() {
  return <AdminAuditPage />;
}
