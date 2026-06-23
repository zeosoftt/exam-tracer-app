'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const VercelAnalyticsLazy = dynamic(() => import('@/components/analytics/VercelAnalyticsLazy'), {
  ssr: false,
});

/** Vercel Analytics — dashboard dışında (gereksiz chunk yükü). */
export function ConditionalVercelAnalytics() {
  const pathname = usePathname();

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return <VercelAnalyticsLazy />;
}
