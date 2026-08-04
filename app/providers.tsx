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

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const withSession = routeNeedsSession(pathname);

  return (
    <ThemeProvider>
      {withSession ? (
        <SessionProvider refetchOnWindowFocus={false}>
          <SentryUserSync />
          {children}
        </SessionProvider>
      ) : (
        children
      )}
    </ThemeProvider>
  );
}
