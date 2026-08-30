import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  buildGuidePageJsonLd,
  buildPublicPageMetadata,
  getGuideSeoEntry,
  getGuideSeoSlugs,
} from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getGuideSeoSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideSeoEntry(slug);
  if (!guide) return {};

  return buildPublicPageMetadata({
    title: guide.pageTitle,
    description: guide.pageDescription,
    path: `/rehber/${slug}`,
  });
}

export default async function RehberSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuideSeoEntry(slug);
  if (!guide) notFound();

  return (
    <>
      <JsonLd data={buildGuidePageJsonLd(guide)} />
      <SeoLandingLayout
        backHref="/rehber"
        backLabel="Tüm rehberler"
        badge={guide.title}
        title={guide.headline}
        intro={guide.description}
        highlights={guide.highlights}
        breadcrumbs={[
          { name: 'Ana sayfa', path: '/' },
          { name: 'Rehber', path: '/rehber' },
          { name: guide.title, path: `/rehber/${guide.id}` },
        ]}
        relatedLinks={[
          { href: '/ozellikler/konu-takibi', label: 'Konu takibi' },
          { href: '/ozellikler/deneme-takibi', label: 'Deneme takibi' },
          { href: '/sss', label: 'SSS' },
        ]}
        ctaSecondaryLinks={[
          { href: '/rehber', label: 'Tüm rehberler' },
          { href: '/onboarding', label: 'Ücretsiz başla' },
        ]}
      />
    </>
  );
}
