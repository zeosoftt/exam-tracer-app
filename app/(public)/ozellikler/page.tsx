/**
 * Özellik landing sayfaları indeksi — /ozellikler
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  buildOzelliklerJsonLd,
  buildPublicPageMetadata,
  FEATURE_SEO_ENTRIES,
} from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <JsonLd data={buildOzelliklerJsonLd()} />
      <MarketingHeader />

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Ana sayfaya dön
        </Link>

        <header className="mb-10 sm:mb-12">
          <h1 className="mb-3 font-display text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl">
            Özellikler
          </h1>
          <p className="text-base leading-relaxed text-stone-600 dark:text-stone-300 sm:text-lg">
            The Goal Lab; konu takibi, deneme analizi, aralıklı tekrar ve odaklı çalışma araçlarını tek platformda
            sunar. Aşağıdaki sayfalarda her özelliği detaylı inceleyebilirsiniz.
          </p>
        </header>

        <ul className="space-y-6">
          {FEATURE_SEO_ENTRIES.map(({ id, name, headline, description }) => (
            <li
              key={id}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900/90 sm:p-8"
            >
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-600" aria-hidden />
                <span className="text-sm font-bold uppercase tracking-wide text-primary-700 dark:text-primary-300">
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
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:underline dark:text-primary-300"
              >
                Detaylı incele
                <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
