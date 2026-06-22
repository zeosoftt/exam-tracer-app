import dynamic from 'next/dynamic';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const DenemeDetailPageClient = dynamic(() => import('./DenemeDetailPageClient'), {
  loading: () => <RouteShellSkeleton />,
});

export default function DenemeDetailPage() {
  return <DenemeDetailPageClient />;
}
