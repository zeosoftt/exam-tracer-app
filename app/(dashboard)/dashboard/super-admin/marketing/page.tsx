import dynamic from 'next/dynamic';
import { AdminPageSkeleton } from '@/components/super-admin/layout/AdminLoading';

const AdminMarketingPage = dynamic(
  () =>
    import('@/components/super-admin/AdminMarketingPage').then((m) => m.AdminMarketingPage),
  { loading: () => <AdminPageSkeleton /> },
);

export default function MarketingPage() {
  return <AdminMarketingPage />;
}
