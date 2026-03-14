import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo/baseUrl';

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
