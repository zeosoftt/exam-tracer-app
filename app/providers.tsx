/**
 * App Providers
 * SessionProvider and other context providers
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SentryUserSync } from '@/components/sentry/SentryUserSync';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <SentryUserSync />
        {children}
      </SessionProvider>
    </ThemeProvider>
  );
}
