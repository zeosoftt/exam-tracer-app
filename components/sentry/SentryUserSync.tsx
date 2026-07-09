'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { isSentryEnabled } from '@/lib/sentry/options';

/** Oturum açmış kullanıcıyı Sentry event'lerine bağlar (PII: id + email hash değil, email opsiyonel). */
export function SentryUserSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (!isSentryEnabled() || status === 'loading') return;

    void import('@sentry/nextjs').then((Sentry) => {
      const user = session?.user;
      if (user?.id) {
        Sentry.setUser({
          id: user.id,
          email: user.email ?? undefined,
        });
      } else {
        Sentry.setUser(null);
      }
    });
  }, [session?.user, status]);

  return null;
}
