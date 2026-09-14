import dynamic from 'next/dynamic';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const AdminUsersPage = dynamic(
  () => import('@/components/super-admin/AdminUsersPage').then((m) => m.AdminUsersPage),
  { loading: () => <RouteShellSkeleton /> },
);

export default function UsersPage() {
  return <AdminUsersPage />;
}
