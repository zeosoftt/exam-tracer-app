import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo/baseUrl';

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard', '/dashboard/', '/api/'] },
      { userAgent: 'Googlebot', allow: '/', disallow: ['/dashboard', '/dashboard/', '/api/'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
