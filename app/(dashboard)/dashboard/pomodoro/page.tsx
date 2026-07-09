/**
 * Pomodoro — ağır istemci chunk’ı ilk boyamadan sonra yüklenir (TBT).
 */

import dynamic from 'next/dynamic';
import { requirePageSession } from '@/lib/auth/pageSession';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const PomodoroPageClient = dynamic(() => import('./PomodoroPageClient'), {
  loading: () => <RouteShellSkeleton />,
});

export default async function PomodoroPage() {
  await requirePageSession();
  return <PomodoroPageClient />;
}
