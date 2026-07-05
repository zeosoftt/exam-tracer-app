import type { Metadata } from 'next';
import Link from 'next/link';
import {
  buildPublicPageMetadata,
  buildRehberJsonLd,
  GUIDE_SEO_ENTRIES,
} from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicBackLink } from '@/components/layout/PublicBackLink';
import { PublicPageCta } from '@/components/layout/PublicPageCta';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { ArrowRight, BookOpen } from 'lucide-react';

const PAGE_TITLE = 'Rehber — Sınav Hazırlığı ve Deneme Takibi';
const PAGE_DESCRIPTION =
  'KPSS konu takibi, kurum sonuç linki ile deneme ekleme ve net takibi rehberleri. The Goal Lab kullanım ipuçları.';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicPageMetadata({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    path: '/rehber',
  });
}

export default function RehberPage() {
  return (
    <PublicPageShell>
      <JsonLd data={buildRehberJsonLd()} />
      <PublicBackLink href="/" label="Ana sayfaya dön" />

      <LandingReveal>
        <header className="mb-10 sm:mb-12">
          <p className="landing-section-eyebrow mb-3 text-xs font-bold tracking-[0.14em] text-primary-700 dark:text-primary-300">
            REHBER
          </p>
          <h1 className="mb-3 font-display text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl">
            <span className="landing-gradient-text">Sınav hazırlığı rehberleri</span>
          </h1>
          <p className="text-base leading-relaxed text-stone-600 dark:text-stone-300 sm:text-lg">
            Konu takibi, deneme kaydı ve kurum sonuç linki kullanımı hakkında pratik adımlar.
          </p>
        </header>
      </LandingReveal>

      <ul className="space-y-5">
        {GUIDE_SEO_ENTRIES.map(({ id, title, headline, description }, index) => (
          <LandingReveal key={id} delay={index * 50}>
            <li className="landing-glass-card landing-hover-lift rounded-2xl p-5 sm:p-8">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary-600" aria-hidden />
                <span className="landing-section-eyebrow text-xs font-bold tracking-[0.12em] text-primary-700 dark:text-primary-300">
                  {title}
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 sm:text-2xl">
                {headline}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300 sm:text-base">
                {description}
              </p>
              <Link
                href={`/rehber/${id}`}
                className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:underline dark:text-primary-300"
              >
                Rehberi oku
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          </LandingReveal>
        ))}
      </ul>

      <PublicPageCta
        message="Rehberleri uygulamak için ücretsiz hesap oluşturun."
        secondaryLinks={[
          { href: '/ozellikler', label: 'Özellikler' },
          { href: '/sss', label: 'SSS' },
        ]}
      />
    </PublicPageShell>
  );
}
