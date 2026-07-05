'use client';

import { useCurrentUser } from './useCurrentUser';

export function useOrganization() {
  const { activeOrganizationId, updateSession } = useCurrentUser();

  async function switchOrganization(organizationId: string) {
    const response = await fetch('/api/organizations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId }),
    });

    if (!response.ok) {
      throw new Error('Organizasyon değiştirilemedi');
    }

    await updateSession?.({ activeOrganizationId: organizationId });
    return response.json();
  }

  return {
    organizationId: activeOrganizationId,
    switchOrganization,
  };
}
