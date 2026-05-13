/**
 * Onboarding — çok adımlı sihirbaz ağır chunk olarak yüklenir (TBT).
 */

import dynamic from 'next/dynamic';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const OnboardingPageClient = dynamic(() => import('./OnboardingPageClient'), {
  loading: () => <RouteShellSkeleton />,
});

export default function OnboardingPage() {
  return <OnboardingPageClient />;
}
