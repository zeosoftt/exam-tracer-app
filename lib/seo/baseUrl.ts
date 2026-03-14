/**
 * Canonical base URL for SEO (sitemap, robots, metadata, JSON-LD).
 * Search Console'daki site ile aynı olmalı.
 */
export function getBaseUrl(): string {
  const url =
    process.env.SITE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim()}` : 'https://thegoallab.com');
  return url.replace(/\/$/, '');
}
