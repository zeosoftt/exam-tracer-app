'use client';

import { useSession as useNextAuthSession } from 'next-auth/react';

/** NextAuth oturumu — proje genelinde tek hook. */
export function useSession(options?: { required?: boolean }) {
  return useNextAuthSession({ required: options?.required ?? false });
}
