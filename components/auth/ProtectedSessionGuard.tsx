'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getSession, useSession } from 'next-auth/react';
import { buildLoginUrl } from '@/lib/auth/authPaths';

/**
 * Çıkış sonrası bfcache ile korumalı sayfanın açılmasını engeller.
 * Oturum yoksa callbackUrl ile login'e yönlendirir.
 */
export function ProtectedSessionGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const callbackPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const { status } = useSession({ required: false });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(buildLoginUrl({ callbackUrl: callbackPath }));
    }
  }, [status, router, callbackPath]);

  useEffect(() => {
    const ensureAuthenticated = async () => {
      const session = await getSession();
      if (!session?.user?.id) {
        router.replace(buildLoginUrl({ callbackUrl: callbackPath }));
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
  }, [router, callbackPath]);

  return null;
}
