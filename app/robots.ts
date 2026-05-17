import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo/baseUrl';

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();
  let host: string | undefined;
  try {
    host = new URL(base).host;
  } catch {
    host = undefined;
  }

  const disallow = [
    '/dashboard',
    '/dashboard/',
    '/api/',
    '/auth/',
  ] as const;

  return {
    host,
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...disallow],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [...disallow],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
