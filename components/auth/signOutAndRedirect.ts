import { signOut } from 'next-auth/react';

/** Oturumu kapatır ve geçmişte panel sayfası kalmaması için replace ile ana sayfaya gider. */
export async function signOutAndRedirect(homePath = '/'): Promise<void> {
  await signOut({ redirect: false });
  window.location.replace(homePath);
}
