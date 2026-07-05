/**
 * Client-safe auth path helpers — no server/Node imports.
 */

export const AUTH_PATHS = {
  login: '/auth/login',
  register: '/auth/register',
  verifyEmail: '/auth/verify-email',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  error: '/auth/error',
  defaultPostLogin: '/dashboard',
} as const;

export function buildLoginUrl(options?: { callbackUrl?: string; expired?: boolean }): string {
  const params = new URLSearchParams();
  if (options?.callbackUrl) {
    params.set('callbackUrl', options.callbackUrl);
  }
  if (options?.expired) {
    params.set('expired', '1');
  }
  const query = params.toString();
  return query ? `${AUTH_PATHS.login}?${query}` : AUTH_PATHS.login;
}

export function sanitizeCallbackUrl(raw: string | null | undefined, origin: string): string | null {
  if (!raw || !raw.startsWith('/')) return null;
  if (raw.startsWith('//')) return null;
  if (raw.startsWith('/auth/login') || raw.startsWith('/auth/register')) return null;
  try {
    const url = new URL(raw, origin);
    if (url.origin !== origin) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}
