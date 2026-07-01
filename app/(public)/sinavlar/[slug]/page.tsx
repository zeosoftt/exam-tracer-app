import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  buildExamPageJsonLd,
  buildPublicPageMetadata,
  getExamSeoEntry,
  getExamSeoSlugs,
} from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { SeoLandingLayout } from '@/components/seo/SeoLandingLayout';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getExamSeoSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const exam = getExamSeoEntry(slug);
  if (!exam) return {};

  return buildPublicPageMetadata({
    title: exam.pageTitle,
    description: exam.pageDescription,
    path: `/sinavlar/${slug}`,
  });
}

export default async function SinavSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const exam = getExamSeoEntry(slug);
  if (!exam) notFound();

  return (
    <>
      <JsonLd data={buildExamPageJsonLd(exam)} />
      <SeoLandingLayout
        backHref="/sinavlar"
        backLabel="Tüm sınavlar"
        badge={exam.name}
        title={exam.headline}
        intro={exam.description}
        highlights={exam.highlights}
        relatedLinks={[
          { href: '/ozellikler/konu-takibi', label: 'Konu takibi' },
          { href: '/ozellikler/deneme-takibi', label: 'Deneme takibi' },
          { href: '/sss', label: 'SSS' },
        ]}
        ctaSecondaryLinks={[
          { href: '/sss', label: 'SSS' },
          { href: '/sinavlar', label: 'Tüm sınavlar' },
        ]}
      />
    </>
  );
}
