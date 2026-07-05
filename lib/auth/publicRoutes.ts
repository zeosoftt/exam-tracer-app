/**
 * Middleware ve route guard'lar için public path tanımları.
 */

export const PUBLIC_EXACT_PATHS = new Set([
  '/',
  '/icon.svg',
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
  '/llms-full.txt',
  '/manifest.webmanifest',
  '/opengraph-image',
]);

export const PUBLIC_PREFIX_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/error',
  '/onboarding',
  '/destek',
  '/sinavlar',
  '/ozellikler',
  '/rehber',
  '/sss',
  '/api/auth',
  '/api/health',
  '/api/exams/available',
  '/api/support',
  '/api/analytics',
] as const;

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/opengraph-image/')) return true;
  return PUBLIC_PREFIX_PATHS.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
