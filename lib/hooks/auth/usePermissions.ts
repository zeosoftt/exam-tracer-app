'use client';

import { useMemo } from 'react';
import { canCreateExam, type UserPermissions } from '@/lib/auth/permissions';
import { useCurrentUser } from './useCurrentUser';

export function usePermissions() {
  const { userId, role, institutionId } = useCurrentUser();

  const permissions = useMemo<UserPermissions | null>(() => {
    if (!userId || !role) return null;
    return {
      userId,
      role: role as UserPermissions['role'],
      institutionId,
    };
  }, [userId, role, institutionId]);

  return {
    permissions,
    canCreateExam: permissions ? canCreateExam(permissions) : false,
    isAdmin: role === 'ADMIN',
    isInstitutionAdmin: role === 'INSTITUTION_ADMIN',
  };
}
