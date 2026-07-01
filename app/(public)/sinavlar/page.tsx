/**
 * Sınav odaklı SEO sayfası — uzun kuyruk anahtar kelimeler (KPSS konu takibi vb.)
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  buildPublicPageMetadata,
  buildSinavlarJsonLd,
  EXAM_SEO_ENTRIES,
  EXAM_SEO_PAGE_DESCRIPTION,
  EXAM_SEO_PAGE_TITLE,
} from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicBackLink } from '@/components/layout/PublicBackLink';
import { PublicPageCta } from '@/components/layout/PublicPageCta';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { ArrowRight, Award } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicPageMetadata({
    title: EXAM_SEO_PAGE_TITLE,
    description: EXAM_SEO_PAGE_DESCRIPTION,
    path: '/sinavlar',
  });
}

export default function SinavlarPage() {
  return (
    <PublicPageShell>
      <JsonLd data={buildSinavlarJsonLd()} />
      <PublicBackLink href="/" label="Ana sayfaya dön" />

      <LandingReveal>
        <header className="mb-10 sm:mb-12">
          <p className="landing-section-eyebrow mb-3 text-xs font-bold tracking-[0.14em] text-primary-700 dark:text-primary-300">
            SINAVLAR
          </p>
          <h1 className="mb-3 font-display text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl">
            <span className="landing-gradient-text">Desteklenen sınavlar</span>
          </h1>
          <p className="text-base leading-relaxed text-stone-600 dark:text-stone-300 sm:text-lg">
            The Goal Lab, KPSS, ÖABT, ALES, YKS, DGS ve YDS hazırlığında konu takibi, deneme kaydı ve ÖSYM uyumlu
            puan hesaplama sunar. Aşağıda her sınav için ne yapabileceğinizi özetledik; ücretsiz hesap açarak
            hemen başlayabilirsiniz.
          </p>
        </header>
      </LandingReveal>

      <ul className="space-y-5">
        {EXAM_SEO_ENTRIES.map(({ id, name, headline, description }, index) => (
          <LandingReveal key={id} delay={index * 50}>
            <li
              id={id}
              className="landing-glass-card landing-hover-lift scroll-mt-28 rounded-2xl p-5 sm:p-8"
            >
              <div className="mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary-600" aria-hidden />
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
                href={`/sinavlar/${id}`}
                className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:underline dark:text-primary-300"
              >
                {name} için detaylı sayfa
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          </LandingReveal>
        ))}
      </ul>

      <PublicPageCta
        message="Kurum içi sınav veya listede olmayan bir yapı mı kullanıyorsunuz? Ders ve konu ağacını kendiniz tanımlayabilirsiniz."
        secondaryLinks={[
          { href: '/sss', label: 'Sıkça sorulan sorular' },
          { href: '/destek', label: 'Destek' },
        ]}
      />
    </PublicPageShell>
  );
}
