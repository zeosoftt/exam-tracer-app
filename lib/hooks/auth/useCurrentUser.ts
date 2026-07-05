'use client';

import { useSession } from './useSession';

export function useCurrentUser() {
  const { data: session, status, update } = useSession();

  return {
    user: session?.user ?? null,
    userId: session?.user?.id ?? null,
    email: session?.user?.email ?? null,
    name: session?.user?.name ?? null,
    role: session?.user?.role ?? null,
    institutionId: session?.user?.institutionId ?? null,
    activeOrganizationId: session?.user?.activeOrganizationId ?? null,
    emailVerified: session?.user?.emailVerified ?? false,
    isAuthenticated: status === 'authenticated' && Boolean(session?.user?.id),
    isLoading: status === 'loading',
    updateSession: update,
  };
}
