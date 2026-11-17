'use client';

import type { ReactNode } from 'react';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { SentryUserSync } from '@/components/sentry/SentryUserSync';

/**
 * Yalnızca oturumlu rota gruplarında (dashboard) kullanılır.
 * Sunucudan gelen `session` prop'u sayesinde SessionProvider mount'ta /api/auth/session çağırmaz;
 * public sayfalar ise hiç SessionProvider yüklemez (anonim ziyaretçi için fonksiyon çağrısı yok).
 */
export function AppSessionProvider({
  session,
  children,
}: {
  session: Session | null;
  children: ReactNode;
}) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <SentryUserSync />
      {children}
    </SessionProvider>
  );
}
