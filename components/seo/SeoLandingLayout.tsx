'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { MarketingHeader } from '@/components/layout/MarketingHeader';

type SeoLandingLayoutProps = {
  backHref: string;
  backLabel: string;
  badge?: string;
  title: string;
  intro: string;
  highlights: readonly string[];
  relatedLinks?: Array<{ href: string; label: string }>;
};

export function SeoLandingLayout({
  backHref,
  backLabel,
  badge,
  title,
  intro,
  highlights,
  relatedLinks,
}: SeoLandingLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <MarketingHeader />

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <Link
          href={backHref}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <header className="mb-8 sm:mb-10">
          {badge ? (
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-primary-700 dark:text-primary-300">
              {badge}
            </p>
          ) : null}
          <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-stone-600 dark:text-stone-300 sm:text-lg">{intro}</p>
        </header>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900/90 sm:p-8">
          <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">Neler yapabilirsiniz?</h2>
          <ul className="mt-4 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-stone-600 dark:text-stone-300 sm:text-base">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {relatedLinks && relatedLinks.length > 0 ? (
          <nav className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="İlgili sayfalar">
            {relatedLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="font-medium text-primary-700 hover:underline dark:text-primary-300">
                {label}
              </Link>
            ))}
          </nav>
        ) : null}

        <div className="mt-10 rounded-2xl border border-primary-200 bg-primary-50/80 p-6 text-center dark:border-primary-800 dark:bg-primary-950/40 sm:p-8">
          <p className="mb-4 text-stone-700 dark:text-stone-200">
            Dakikalar içinde ücretsiz hesap açın; kredi kartı gerekmez.
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
            <Link href="/sinavlar" className="font-medium text-primary-700 hover:underline dark:text-primary-300">
              Tüm sınavlar
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
