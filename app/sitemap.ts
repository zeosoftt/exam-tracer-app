import type { MetadataRoute } from 'next';

// Search Console'da doğruladığınız site ile birebir aynı olmalı (örn. https://thegoallab.com veya https://exam-tracer-app.vercel.app)
// Vercel'de SITE_URL = https://thegoallab.com şeklinde ayarlayın; yoksa NEXTAUTH_URL / VERCEL_URL kullanılır.
function getBaseUrl(): string {
  const url =
    process.env.SITE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim()}` : 'https://thegoallab.com');
  return url.replace(/\/$/, ''); // sondaki slash kaldır
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/onboarding`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/sss`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];
}
