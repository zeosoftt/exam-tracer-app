/**
 * Pomodoro — ağır istemci chunk’ı ilk boyamadan sonra yüklenir (TBT).
 */

import dynamic from 'next/dynamic';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const PomodoroPageClient = dynamic(() => import('./PomodoroPageClient'), {
  loading: () => <RouteShellSkeleton />,
});

export default function PomodoroPage() {
  return <PomodoroPageClient />;
}
