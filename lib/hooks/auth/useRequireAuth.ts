'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_PATHS, buildLoginUrl } from '@/lib/auth/authPaths';
import { useCurrentUser } from './useCurrentUser';
import { useSession } from './useSession';

type UseRequireAuthOptions = {
  redirectTo?: string;
  callbackUrl?: string;
};

/** Oturum yoksa login'e yönlendirir. */
export function useRequireAuth(options?: UseRequireAuthOptions) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status !== 'unauthenticated') return;
    const loginUrl = buildLoginUrl({
      callbackUrl: options?.callbackUrl ?? options?.redirectTo,
    });
    router.replace(loginUrl);
  }, [status, router, options?.callbackUrl, options?.redirectTo]);

  return { isLoading: status === 'loading', isAuthenticated: status === 'authenticated' };
}

/** Belirli legacy role gerektirir (client-side guard). */
export function useRequireRole(requiredRoles: string[]) {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (!user?.role || !requiredRoles.includes(user.role)) {
      router.replace(AUTH_PATHS.defaultPostLogin);
    }
  }, [isLoading, isAuthenticated, user?.role, requiredRoles, router]);

  return { isLoading, isAllowed: Boolean(user?.role && requiredRoles.includes(user.role)) };
}

/** Client-side permission guard (legacy role tabanlı). */
export function useRequirePermission(check: (role: string | null | undefined) => boolean) {
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    if (!check(user?.role)) {
      router.replace(AUTH_PATHS.defaultPostLogin);
    }
  }, [isLoading, isAuthenticated, user?.role, check, router]);

  return { isLoading, isAllowed: isAuthenticated && check(user?.role) };
}
