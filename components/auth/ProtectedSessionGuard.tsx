'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, useSession } from 'next-auth/react';

const LOGIN_PATH = '/auth/login';

/**
 * Çıkış sonrası geri tuşu (bfcache) ile korumalı sayfanın önbellekten açılmasını engeller.
 */
export function ProtectedSessionGuard() {
  const router = useRouter();
  const { status } = useSession({ required: false });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(LOGIN_PATH);
    }
  }, [status, router]);

  useEffect(() => {
    const ensureAuthenticated = async () => {
      const session = await getSession();
      if (!session?.user?.id) {
        router.replace(LOGIN_PATH);
        return false;
      }
      return true;
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      void ensureAuthenticated().then((ok) => {
        if (ok) router.refresh();
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      void ensureAuthenticated();
    };

    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [router]);

  return null;
}
