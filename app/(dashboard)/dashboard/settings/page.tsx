/**
 * Ayarlar — ağır istemci chunk’ı ertelenir (TBT).
 */

import dynamic from 'next/dynamic';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const SettingsPageClient = dynamic(() => import('./SettingsPageClient'), {
  loading: () => <RouteShellSkeleton />,
});

export default function SettingsPage() {
  return <SettingsPageClient />;
}
