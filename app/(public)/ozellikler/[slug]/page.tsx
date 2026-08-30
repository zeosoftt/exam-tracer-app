import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  buildFeaturePageJsonLd,
  buildPublicPageMetadata,
  getFeatureSeoEntry,
  getFeatureSeoSlugs,
} from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getFeatureSeoSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const feature = getFeatureSeoEntry(slug);
  if (!feature) return {};

  return buildPublicPageMetadata({
    title: feature.pageTitle,
    description: feature.pageDescription,
    path: `/ozellikler/${slug}`,
  });
}

export default async function OzellikSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const feature = getFeatureSeoEntry(slug);
  if (!feature) notFound();

  return (
    <>
      <JsonLd data={buildFeaturePageJsonLd(feature)} />
      <SeoLandingLayout
        backHref="/ozellikler"
        backLabel="Tüm özellikler"
        badge={feature.name}
        title={feature.headline}
        intro={feature.description}
        highlights={feature.highlights}
        breadcrumbs={[
          { name: 'Ana sayfa', path: '/' },
          { name: 'Özellikler', path: '/ozellikler' },
          { name: feature.name, path: `/ozellikler/${feature.id}` },
        ]}
        relatedLinks={[
          { href: '/sinavlar', label: 'Desteklenen sınavlar' },
          { href: '/sss', label: 'SSS' },
          { href: '/onboarding', label: 'Ücretsiz kayıt' },
        ]}
        ctaSecondaryLinks={[
          { href: '/sss', label: 'SSS' },
          { href: '/ozellikler', label: 'Tüm özellikler' },
        ]}
      />
    </>
  );
}
