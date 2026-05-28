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
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { ArrowLeft, ArrowRight, Award } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicPageMetadata({
    title: EXAM_SEO_PAGE_TITLE,
    description: EXAM_SEO_PAGE_DESCRIPTION,
    path: '/sinavlar',
  });
}

export default function SinavlarPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <JsonLd data={buildSinavlarJsonLd()} />
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
            Desteklenen sınavlar
          </h1>
          <p className="text-base leading-relaxed text-stone-600 dark:text-stone-300 sm:text-lg">
            The Goal Lab, KPSS, ÖABT, ALES, YKS, DGS ve YDS hazırlığında konu takibi, deneme kaydı ve ÖSYM uyumlu
            puan hesaplama sunar. Aşağıda her sınav için ne yapabileceğinizi özetledik; ücretsiz hesap açarak
            hemen başlayabilirsiniz.
          </p>
        </header>

        <ul className="space-y-6">
          {EXAM_SEO_ENTRIES.map(({ id, name, headline, description }) => (
            <li
              key={id}
              id={id}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900/90 sm:p-8"
            >
              <div className="mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary-600" aria-hidden />
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
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-2xl border border-primary-200 bg-primary-50/80 p-6 text-center dark:border-primary-800 dark:bg-primary-950/40 sm:p-8">
          <p className="mb-4 text-stone-700 dark:text-stone-200">
            Kurum içi sınav veya listede olmayan bir yapı mı kullanıyorsunuz? Ders ve konu ağacını kendiniz
            tanımlayabilirsiniz.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-700 to-primary-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Ücretsiz başla
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-sm text-stone-600 dark:text-stone-400">
            <Link href="/sss" className="font-medium text-primary-700 hover:underline dark:text-primary-300">
              Sıkça sorulan sorular
            </Link>
            {' · '}
            <Link href="/destek" className="font-medium text-primary-700 hover:underline dark:text-primary-300">
              Destek
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
