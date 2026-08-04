/**
 * App Providers
 * SessionProvider and other context providers
 */

'use client';

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SentryUserSync } from '@/components/sentry/SentryUserSync';

function routeNeedsSession(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/onboarding')
  );
}

function OptionalSentryUserSync() {
  const pathname = usePathname();
  if (!routeNeedsSession(pathname)) return null;
  return <SentryUserSync />;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider refetchOnWindowFocus={false}>
        <OptionalSentryUserSync />
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}
