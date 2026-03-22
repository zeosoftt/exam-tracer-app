import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo/baseUrl';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  // Sadece pazarlama / bilgi sayfaları (auth sayfaları noindex; sitemap'te yok)
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/onboarding`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: `${base}/sss`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];
}
