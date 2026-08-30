/**
 * Sıkça Sorulan Sorular (SSS) sayfası
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPublicPageMetadata, buildSssJsonLd } from '@/lib/seo';
import { PUBLIC_FAQ_ITEMS } from '@/lib/seo/faqData';
import { JsonLd } from '@/components/seo/JsonLd';
import { PublicBackLink } from '@/components/layout/PublicBackLink';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { HelpCircle } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Sıkça Sorulan Sorular';
  const description =
    'KPSS, ALES, ÖABT, YKS ve DGS hakkında SSS: ücretsiz plan, konu takibi, deneme analizi, ÖSYM puan hesaplama, veri güvenliği ve kurumsal kullanım — The Goal Lab.';
  return buildPublicPageMetadata({ title, description, path: '/sss' });
}

export default async function SSSPage() {
  return (
    <PublicPageShell>
      <JsonLd data={buildSssJsonLd()} />
      <PublicBackLink href="/" label="Ana sayfaya dön" />

      <LandingReveal>
        <header className="mb-10 sm:mb-12">
          <p className="landing-section-eyebrow mb-3 text-xs font-bold tracking-[0.14em] text-primary-700 dark:text-primary-300">
            SSS
          </p>
          <h1 className="mb-2 font-display text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl">
            <span className="landing-gradient-text">Sıkça Sorulan Sorular</span>
          </h1>
          <p className="text-base leading-relaxed text-stone-600 dark:text-stone-400 sm:text-lg">
            KPSS konu takibi, ALES ve YKS deneme kaydı, ÖABT hazırlığı ve ücretsiz plan hakkında sık sorulan sorular.
            Tüm sınav listesi için{' '}
            <Link href="/sinavlar" className="font-medium text-primary-700 hover:underline dark:text-primary-300">
              desteklenen sınavlar
            </Link>{' '}
            sayfasına bakın.
          </p>
        </header>
      </LandingReveal>

      <div className="space-y-4">
        {PUBLIC_FAQ_ITEMS.map(({ q, a }, index) => (
          <LandingReveal key={q} delay={index * 30}>
            <article className="landing-glass-card landing-hover-lift rounded-2xl p-4 sm:p-5">
              <h2 className="mb-2 flex items-start gap-2 font-semibold text-stone-900 dark:text-stone-100">
                <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" aria-hidden />
                {q}
              </h2>
              <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300 sm:text-base">
                {q === 'Hangi sınavları destekliyorsunuz?' ? (
                  <>
                    KPSS, ÖABT, ALES, DGS, YKS (TYT/AYT), YDS, YÖKDİL, TUS, DUS ve kurum içi sınavlar. Hazır
                    yapı seçebilir veya kendi ders–konu ağacınızı oluşturabilirsiniz. Detay için{' '}
                    <Link
                      href="/sinavlar"
                      className="font-medium text-primary-700 hover:underline dark:text-primary-300"
                    >
                      desteklenen sınavlar
                    </Link>{' '}
                    sayfasına bakın.
                  </>
                ) : (
                  a
                )}
              </p>
            </article>
          </LandingReveal>
        ))}
      </div>

      <LandingReveal className="mt-10 text-center">
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Başka sorunuz mu var?{' '}
          <Link href="/destek" className="font-semibold text-primary-700 hover:underline dark:text-primary-300">
            Destek sayfasından yazın
          </Link>
          .
        </p>
      </LandingReveal>
    </PublicPageShell>
  );
}
