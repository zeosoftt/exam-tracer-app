/**
 * Canonical base URL for SEO (sitemap, robots, metadata, JSON-LD).
 * Production fallback: canlı domain (thegoallabs.com).
 * Vercel'de SITE_URL=https://thegoallabs.com tanımlayın; yoksa bu değer kullanılır.
 */
const CANONICAL_PRODUCTION_URL = 'https://thegoallabs.com';

export function getBaseUrl(): string {
  const siteUrl = process.env.SITE_URL?.trim();
  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim();
  if (siteUrl) return siteUrl.replace(/\/$/, '');
  if (nextAuthUrl) return nextAuthUrl.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production') return CANONICAL_PRODUCTION_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.trim()}`.replace(/\/$/, '');
  return 'http://localhost:3000';
}
