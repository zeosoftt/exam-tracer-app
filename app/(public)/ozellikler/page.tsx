/**
 * Özellik landing sayfaları indeksi — /ozellikler
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  buildOzelliklerJsonLd,
  buildPublicPageMetadata,
  FEATURE_SEO_ENTRIES,
  PRODUCT_FEATURES_SUMMARY,
} from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicBackLink } from '@/components/layout/PublicBackLink';
import { PublicPageCta } from '@/components/layout/PublicPageCta';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { ArrowRight, Sparkles } from 'lucide-react';

const PAGE_TITLE = 'Özellikler — Konu Takibi, Deneme Analizi, Aralıklı Tekrar';
const PAGE_DESCRIPTION =
  'Konu takibi, deneme net analizi, aralıklı tekrar ve Pomodoro zamanlayıcı. Sınav hazırlığı için The Goal Lab özellikleri.';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicPageMetadata({
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    path: '/ozellikler',
  });
}

export default function OzelliklerPage() {
  return (
    <PublicPageShell>
      <JsonLd data={buildOzelliklerJsonLd()} />
      <PublicBackLink href="/" label="Ana sayfaya dön" />

      <LandingReveal>
        <header className="mb-10 sm:mb-12">
          <p className="landing-section-eyebrow mb-3 text-xs font-bold tracking-[0.14em] text-primary-700 dark:text-primary-300">
            ÖZELLİKLER
          </p>
          <h1 className="mb-3 font-display text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl">
            <span className="landing-gradient-text">Özellikler</span>
          </h1>
          <p className="text-base leading-relaxed text-stone-600 dark:text-stone-300 sm:text-lg">
            {PRODUCT_FEATURES_SUMMARY} Aşağıdaki sayfalarda her özelliği detaylı inceleyebilirsiniz.
          </p>
        </header>
      </LandingReveal>

      <ul className="space-y-5">
        {FEATURE_SEO_ENTRIES.map(({ id, name, headline, description }, index) => (
          <LandingReveal key={id} delay={index * 50}>
            <li className="landing-glass-card landing-hover-lift rounded-2xl p-5 sm:rounded-2xl sm:p-8">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-600" aria-hidden />
                <span className="landing-section-eyebrow text-xs font-bold tracking-[0.12em] text-primary-700 dark:text-primary-300">
                  {name}
                </span>
              </div>
              <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 sm:text-2xl">
                {headline}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300 sm:text-base">
                {description}
              </p>
              <Link
                href={`/ozellikler/${id}`}
                className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:underline dark:text-primary-300"
              >
                Detaylı incele
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          </LandingReveal>
        ))}
      </ul>

      <PublicPageCta
        message="Tüm özellikleri ücretsiz planda deneyin; kredi kartı gerekmez."
        secondaryLinks={[
          { href: '/sinavlar', label: 'Desteklenen sınavlar' },
          { href: '/sss', label: 'SSS' },
        ]}
      />
    </PublicPageShell>
  );
}
