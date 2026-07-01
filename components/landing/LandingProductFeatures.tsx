import Link from 'next/link';
import { ArrowRight, BarChart3, RefreshCw, Target, Timer } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FEATURE_SEO_ENTRIES, PRODUCT_FEATURES_SUMMARY } from '@/lib/seo';

const FEATURE_ICONS: Record<(typeof FEATURE_SEO_ENTRIES)[number]['id'], LucideIcon> = {
  'konu-takibi': Target,
  'deneme-takibi': BarChart3,
  'aralikli-tekrar': RefreshCw,
  pomodoro: Timer,
};

const FEATURE_ACCENTS: Record<
  (typeof FEATURE_SEO_ENTRIES)[number]['id'],
  { icon: string; hover: string; glow: string }
> = {
  'konu-takibi': {
    icon: 'from-primary-600 to-primary-700 shadow-primary-500/25',
    hover: 'hover:border-primary-200 dark:hover:border-primary-800',
    glow: 'from-primary-500/5',
  },
  'deneme-takibi': {
    icon: 'from-amber-700 to-amber-800 shadow-amber-700/25',
    hover: 'hover:border-amber-200 dark:hover:border-amber-900/50',
    glow: 'from-amber-500/5',
  },
  'aralikli-tekrar': {
    icon: 'from-emerald-600 to-emerald-700 shadow-emerald-600/25',
    hover: 'hover:border-emerald-200 dark:hover:border-emerald-900/50',
    glow: 'from-emerald-500/5',
  },
  pomodoro: {
    icon: 'from-violet-600 to-violet-700 shadow-violet-600/25',
    hover: 'hover:border-violet-200 dark:hover:border-violet-900/50',
    glow: 'from-violet-500/5',
  },
};

export function LandingProductFeatures() {
  return (
    <section id="ozellikler" className="py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-3 font-display text-3xl font-bold text-stone-900 dark:text-stone-100 sm:mb-4 sm:text-4xl lg:text-5xl">
            Neden The Goal Lab?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-stone-600 dark:text-stone-300 sm:text-xl">
            {PRODUCT_FEATURES_SUMMARY}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2">
          {FEATURE_SEO_ENTRIES.map(({ id, name, headline, description }) => {
            const Icon = FEATURE_ICONS[id];
            const accent = FEATURE_ACCENTS[id];

            return (
              <article
                key={id}
                className={`group relative rounded-3xl border border-stone-100 bg-white p-6 transition-all duration-300 hover:shadow-soft-lg dark:border-stone-800 dark:bg-stone-900/90 sm:p-8 ${accent.hover}`}
              >
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${accent.glow} to-transparent opacity-0 transition-opacity group-hover:opacity-100`}
                />
                <div className="relative flex h-full flex-col">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg sm:h-14 sm:w-14 ${accent.icon}`}
                    >
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                      {name}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 sm:text-2xl">
                    {headline}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600 dark:text-stone-300 sm:text-base">
                    {description}
                  </p>
                  <Link
                    href={`/ozellikler/${id}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
                  >
                    Detaylı incele
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/ozellikler"
            className="inline-flex items-center gap-2 font-semibold text-primary-700 transition-colors hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
          >
            Tüm özellikleri gör
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
