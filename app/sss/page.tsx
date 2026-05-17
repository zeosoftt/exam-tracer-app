/**
 * Sıkça Sorulan Sorular (SSS) sayfası
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPublicPageMetadata, buildSssJsonLd } from '@/lib/seo';
import { PUBLIC_FAQ_ITEMS } from '@/lib/seo/faqData';
import { JsonLd } from '@/components/seo/JsonLd';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Sıkça Sorulan Sorular';
  const description =
    'The Goal Lab (thegoallab) SSS: ücretsiz plan, KPSS/ALES/ÖABT desteği, deneme takibi, ÖSYM puanı, veri güvenliği ve kurumsal kullanım.';
  return buildPublicPageMetadata({ title, description, path: '/sss' });
}

export default async function SSSPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <JsonLd data={buildSssJsonLd()} />
      <MarketingHeader />

      <main className="mx-auto max-w-3xl px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8 lg:pb-20 lg:pt-28">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Ana sayfaya dön
        </Link>
        <div className="mb-10 sm:mb-12">
          <h1 className="mb-2 font-display text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl">
            Sıkça Sorulan Sorular
          </h1>
          <p className="text-base text-stone-600 dark:text-stone-400 sm:text-lg">Merak ettiklerinizin yanıtları</p>
        </div>
        <div className="space-y-4">
          {PUBLIC_FAQ_ITEMS.map(({ q, a }) => (
            <article
              key={q}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-soft dark:border-stone-800 dark:bg-stone-900/90 sm:p-5"
            >
              <h2 className="mb-2 flex items-start gap-2 font-semibold text-stone-900 dark:text-stone-100">
                <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" aria-hidden />
                {q}
              </h2>
              <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300 sm:text-base">{a}</p>
            </article>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-stone-600 dark:text-stone-400">
          Başka sorunuz mu var?{' '}
          <Link href="/destek" className="font-semibold text-primary-700 hover:underline dark:text-primary-300">
            Destek sayfasından yazın
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
