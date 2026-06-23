'use client';

import { usePathname } from 'next/navigation';
import type { PublicTrackingConfig } from '@/lib/siteSettings';
import { SiteTrackingScripts } from '@/components/analytics/SiteTracking';

function isDashboardRoute(pathname: string | null): boolean {
  return pathname?.startsWith('/dashboard') ?? false;
}

/** GA / AdSense / GTM — yalnızca public rotalarda (dashboard TBT ve payload azaltma). */
export function ConditionalSiteTracking({ tracking }: { tracking: PublicTrackingConfig }) {
  const pathname = usePathname();

  if (isDashboardRoute(pathname)) {
    return null;
  }

  return <SiteTrackingScripts tracking={tracking} />;
}
