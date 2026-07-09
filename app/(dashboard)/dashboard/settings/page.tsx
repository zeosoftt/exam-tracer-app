/**
 * Ayarlar — ağır istemci chunk’ı ertelenir (TBT).
 */

import dynamic from 'next/dynamic';
import { requirePageSession } from '@/lib/auth/pageSession';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const SettingsPageClient = dynamic(() => import('./SettingsPageClient'), {
  loading: () => <RouteShellSkeleton />,
});

export default async function SettingsPage() {
  await requirePageSession();
  return <SettingsPageClient />;
}
