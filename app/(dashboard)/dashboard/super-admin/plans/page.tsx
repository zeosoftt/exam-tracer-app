/**
 * Planlar & Abonelikler
 * Plan listesi, kullanıcı dağılımı. Sadece ADMIN.
 */

import dynamic from 'next/dynamic';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const PlansContent = dynamic(
  () => import('@/components/super-admin/PlansContent').then((m) => m.PlansContent),
  { loading: () => <RouteShellSkeleton /> },
);

export default function PlansPage() {
  // Auth: layout.tsx → requireAdminPageSession
  return <PlansContent />;
}
