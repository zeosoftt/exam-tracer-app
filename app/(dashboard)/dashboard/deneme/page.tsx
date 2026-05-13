/**
 * Deneme takibi — ağır istemci chunk’ı ertelenir (TBT).
 */

import dynamic from 'next/dynamic';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const DenemePageClient = dynamic(() => import('./DenemePageClient'), {
  loading: () => <RouteShellSkeleton />,
});

export default function DenemePage() {
  return <DenemePageClient />;
}
