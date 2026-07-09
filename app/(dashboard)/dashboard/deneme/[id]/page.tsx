import dynamic from 'next/dynamic';
import { requirePageSession } from '@/lib/auth/pageSession';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const DenemeDetailPageClient = dynamic(() => import('./DenemeDetailPageClient'), {
  loading: () => <RouteShellSkeleton />,
});

export default async function DenemeDetailPage() {
  await requirePageSession();
  return <DenemeDetailPageClient />;
}
