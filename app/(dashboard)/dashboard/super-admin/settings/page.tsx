import dynamic from 'next/dynamic';
import { AdminPageSkeleton } from '@/components/super-admin/layout/AdminLoading';

const AdminSettingsPage = dynamic(
  () =>
    import('@/components/super-admin/AdminSettingsPage').then((m) => m.AdminSettingsPage),
  { loading: () => <AdminPageSkeleton /> },
);

export default function SettingsPage() {
  return <AdminSettingsPage />;
}
