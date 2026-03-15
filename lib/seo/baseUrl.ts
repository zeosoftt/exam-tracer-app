/**
 * Canonical base URL for SEO (sitemap, robots, metadata, JSON-LD).
 * Production'da her zaman thegoallab.com kullanılır (Vercel URL yerine).
 * Farklı domain için Vercel'de SITE_URL veya NEXTAUTH_URL tanımlayın.
 */
const CANONICAL_PRODUCTION_URL = 'https://thegoallab.com';

export function getBaseUrl(): string {
  const siteUrl = process.env.SITE_URL?.trim();
  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim();
  if (siteUrl) return siteUrl.replace(/\/$/, '');
  if (nextAuthUrl) return nextAuthUrl.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production') return CANONICAL_PRODUCTION_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.trim()}`.replace(/\/$/, '');
  return 'http://localhost:3000';
}
