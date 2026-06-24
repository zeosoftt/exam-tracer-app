import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo/baseUrl';
import { getExamSeoSlugs } from '@/lib/seo/exams';
import { getFeatureSeoSlugs } from '@/lib/seo/features';

/** Statik pazarlama sayfaları — auth ve dashboard dahil değil */
const PUBLIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency'];
  priority: number;
}> = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/onboarding', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/sinavlar', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/ozellikler', changeFrequency: 'monthly', priority: 0.88 },
  { path: '/sss', changeFrequency: 'monthly', priority: 0.85 },
  { path: '/destek', changeFrequency: 'monthly', priority: 0.75 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();
  const lastModified = new Date();

  const staticEntries = PUBLIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: path ? `${base}${path}` : base,
    lastModified,
    changeFrequency,
    priority,
  }));

  const examEntries = getExamSeoSlugs().map((slug) => ({
    url: `${base}/sinavlar/${slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.82,
  }));

  const featureEntries = getFeatureSeoSlugs().map((slug) => ({
    url: `${base}/ozellikler/${slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...examEntries, ...featureEntries];
}
