/**
 * Root Layout
 * Global layout with error boundary
 */

import type { Metadata } from 'next';
import { cache } from 'react';
import { Inter } from 'next/font/google';
import { ConditionalSiteTracking } from '@/components/analytics/ConditionalSiteTracking';
import { ConditionalVercelAnalytics } from '@/components/analytics/ConditionalVercelAnalytics';
import { buildRootMetadata, viewport } from '@/lib/seo/siteSeo';
import { getPublicTrackingConfig } from '@/lib/siteSettings';
import './globals.css';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
  adjustFontFallback: true,
});

export { viewport };

const getTracking = cache(getPublicTrackingConfig);

export async function generateMetadata(): Promise<Metadata> {
  const tracking = await getTracking();
  const base = buildRootMetadata();

  if (!tracking.adsenseEnabled || !tracking.adsenseClientId) {
    return base;
  }

  return {
    ...base,
    other: {
      'google-adsense-account': tracking.adsenseClientId,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tracking = await getTracking();

  return (
    <html lang="tr" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ConditionalSiteTracking tracking={tracking} />
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
        <ConditionalVercelAnalytics />
      </body>
    </html>
  );
}
