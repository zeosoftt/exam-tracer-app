import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo/baseUrl';

/** Statik pazarlama sayfaları — auth ve dashboard dahil değil */
const PUBLIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'];
  priority: number;
}> = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/onboarding', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/sinavlar', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/sss', changeFrequency: 'monthly', priority: 0.85 },
  { path: '/destek', changeFrequency: 'monthly', priority: 0.75 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  const lastModified = new Date();

  return PUBLIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: path ? `${base}${path}` : base,
    lastModified,
    changeFrequency,
    priority,
  }));
}
