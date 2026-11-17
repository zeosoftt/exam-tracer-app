import dynamic from 'next/dynamic';
import { AdminPageSkeleton } from '@/components/super-admin/layout/AdminLoading';

const AdminUsersPage = dynamic(
  () => import('@/components/super-admin/AdminUsersPage').then((m) => m.AdminUsersPage),
  { loading: () => <AdminPageSkeleton /> },
);

export default function UsersPage() {
  return <AdminUsersPage />;
}
