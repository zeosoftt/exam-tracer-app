import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo/baseUrl';
import { SEO_DEFAULT_DESCRIPTION, SEO_SITE_NAME } from '@/lib/seo/siteSeo';

export default function manifest(): MetadataRoute.Manifest {
  const base = getBaseUrl();
  return {
    id: `${base}/`,
    name: SEO_SITE_NAME,
    short_name: 'Goal Lab',
    description: SEO_DEFAULT_DESCRIPTION,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#fafaf9',
    theme_color: '#0d9488',
    lang: 'tr',
    dir: 'ltr',
    categories: ['education', 'productivity'],
    icons: [
      {
        src: `${base}/icon.svg`,
        type: 'image/svg+xml',
        sizes: 'any',
        purpose: 'any',
      },
    ],
  };
}
