import dynamic from 'next/dynamic';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const AdminSettingsPage = dynamic(
  () =>
    import('@/components/super-admin/AdminSettingsPage').then((m) => m.AdminSettingsPage),
  { loading: () => <RouteShellSkeleton /> },
);

export default function SettingsPage() {
  return <AdminSettingsPage />;
}
