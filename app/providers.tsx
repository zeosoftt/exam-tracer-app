/**
 * App Providers
 * Tema + first-party oturum süresi ölçümü. Oturum sağlayıcısı (next-auth SessionProvider)
 * yalnızca dashboard layout'unda yüklenir: bkz. components/auth/AppSessionProvider.
 */

'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { SessionDurationTracker } from '@/components/analytics/SessionDurationTracker';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionDurationTracker />
      {children}
    </ThemeProvider>
  );
}
