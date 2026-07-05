import { signOut } from 'next-auth/react';
import { AUTH_PATHS } from '@/lib/auth/authPaths';

type SignOutOptions = {
  homePath?: string;
  clearLocalStorageKeys?: string[];
};

/** Oturumu kapatır, isteğe bağlı local cache temizler, replace ile yönlendirir. */
export async function signOutAndRedirect(options: SignOutOptions = {}): Promise<void> {
  const homePath = options.homePath ?? AUTH_PATHS.login;

  if (typeof window !== 'undefined' && options.clearLocalStorageKeys?.length) {
    for (const key of options.clearLocalStorageKeys) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
  }

  await signOut({ redirect: false, callbackUrl: homePath });
  window.location.replace(homePath);
}
