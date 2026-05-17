import Link from 'next/link';
import { Check, Minus } from 'lucide-react';
import { LandingReveal } from '@/components/landing/LandingReveal';

const ROWS = [
  { feature: 'Sınav / ders / konu takibi', free: true, pro: true },
  { feature: 'Dashboard ve temel istatistikler', free: true, pro: true },
  { feature: 'Deneme kaydı ve ÖSYM puan önizlemesi', free: false, pro: true },
  { feature: 'Net trendi ve gelişmiş analiz', free: false, pro: true },
  { feature: 'Pomodoro zamanlayıcı', free: true, pro: true },
] as const;

export function LandingFreeVsPro() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <LandingReveal className="mb-8 text-center">
          <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            Hangi plan size uygun?
          </h2>
          <p className="mt-2 text-stone-600 dark:text-stone-300">
            Ücretsiz başlayın; deneme takibine ihtiyaç duyduğunuzda Pro&apos;ya geçin.
          </p>
        </LandingReveal>
        <LandingReveal delay={80}>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-900/90">
            <div className="grid grid-cols-[1fr_5rem_5rem] border-b border-stone-100 bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:border-stone-800 dark:bg-stone-950/80 dark:text-stone-400 sm:grid-cols-[1fr_6rem_6rem] sm:text-sm">
              <div className="px-4 py-3 sm:px-6">Özellik</div>
              <div className="px-2 py-3 text-center">Ücretsiz</div>
              <div className="px-2 py-3 text-center text-primary-700 dark:text-primary-300">Pro</div>
            </div>
            {ROWS.map(({ feature, free, pro }, i) => (
              <div
                key={feature}
                className={`grid grid-cols-[1fr_5rem_5rem] items-center border-b border-stone-100 last:border-0 dark:border-stone-800 sm:grid-cols-[1fr_6rem_6rem] ${
                  i % 2 === 0 ? 'bg-white dark:bg-stone-900/90' : 'bg-stone-50/50 dark:bg-stone-950/40'
                }`}
              >
                <div className="px-4 py-3.5 text-sm font-medium text-stone-800 dark:text-stone-200 sm:px-6">
                  {feature}
                </div>
                <div className="flex justify-center py-3.5">
                  {free ? (
                    <Check className="h-5 w-5 text-primary-600" aria-label="Dahil" />
                  ) : (
                    <Minus className="h-5 w-5 text-stone-300 dark:text-stone-600" aria-label="Yok" />
                  )}
                </div>
                <div className="flex justify-center py-3.5">
                  {pro ? (
                    <Check className="h-5 w-5 text-primary-600" aria-label="Dahil" />
                  ) : (
                    <Minus className="h-5 w-5 text-stone-300 dark:text-stone-600" aria-label="Yok" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center">
            <Link
              href="/onboarding"
              className="font-semibold text-primary-700 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
            >
              Ücretsiz hesapla başla →
            </Link>
          </p>
        </LandingReveal>
      </div>
    </section>
  );
}
