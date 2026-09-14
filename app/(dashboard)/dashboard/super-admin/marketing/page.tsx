import dynamic from 'next/dynamic';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const AdminMarketingPage = dynamic(
  () =>
    import('@/components/super-admin/AdminMarketingPage').then((m) => m.AdminMarketingPage),
  { loading: () => <RouteShellSkeleton /> },
);

export default function MarketingPage() {
  return <AdminMarketingPage />;
}
