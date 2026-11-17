import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { AppSessionProvider } from '@/components/auth/AppSessionProvider';
import { ProtectedSessionGuard } from '@/components/auth/ProtectedSessionGuard';

/**
 * Uygulama içi sayfalar arama indeksine açılmamalı (gizlilik + tarama bütçesi).
 */
export const metadata: Metadata = {
  title: { template: '%s | The Goal Lab', default: 'Panel' },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default async function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  // Oturum sunucuda bir kez okunur ve istemciye prop olarak verilir → ilk /api/auth/session isteği kalkar.
  const session = await getServerSession(authOptions);

  return (
    <AppSessionProvider session={session}>
      <Suspense fallback={null}>
        <ProtectedSessionGuard />
      </Suspense>
      {children}
    </AppSessionProvider>
  );
}
