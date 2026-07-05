import Link from 'next/link';
import { Check, Minus } from 'lucide-react';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader';

const ROWS = [
  { feature: 'Sınav / ders / konu takibi', free: true, pro: true },
  { feature: 'Dashboard ve temel istatistikler', free: true, pro: true },
  { feature: 'Deneme listesi ve yeni kayıt', free: true, pro: true },
  { feature: 'Deneme detayı, ders/konu analizi ve ÖSYM puan önizlemesi', free: false, pro: true },
  { feature: 'Net trendi ve gelişmiş analiz', free: false, pro: true },
  { feature: 'Pomodoro zamanlayıcı', free: true, pro: true },
] as const;

export function LandingFreeVsPro() {
  return (
    <section className="relative py-12 sm:py-16">
      <div className="landing-dot-grid absolute inset-0 opacity-10 dark:opacity-[0.05]" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <LandingReveal>
          <LandingSectionHeader
            eyebrow="PLAN KARŞILAŞTIRMA"
            title="Hangi plan size uygun?"
            description="Ücretsiz başlayın; deneme detayı ve gelişmiş analiz için Pro'ya geçin."
          />
        </LandingReveal>
        <LandingReveal delay={80}>
          <div className="landing-vibe-glass overflow-hidden rounded-2xl border border-stone-200/80 shadow-sm dark:border-stone-700/80">
            <div className="grid grid-cols-[minmax(0,1fr)_3.5rem_3.5rem] border-b border-stone-100/80 bg-stone-50/70 text-[10px] font-semibold uppercase tracking-wide text-stone-500 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-400 sm:grid-cols-[minmax(0,1fr)_6rem_6rem] sm:text-sm">
              <div className="px-3 py-3 sm:px-6">Özellik</div>
              <div className="px-1 py-3 text-center sm:px-2">Ücretsiz</div>
              <div className="px-1 py-3 text-center text-primary-700 dark:text-primary-300 sm:px-2">Pro</div>
            </div>
            {ROWS.map(({ feature, free, pro }, i) => (
              <div
                key={feature}
                className={`grid grid-cols-[minmax(0,1fr)_3.5rem_3.5rem] items-center border-b border-stone-100/80 last:border-0 dark:border-stone-800 sm:grid-cols-[minmax(0,1fr)_6rem_6rem] ${
                  i % 2 === 0 ? 'bg-white/50 dark:bg-stone-900/50' : 'bg-stone-50/40 dark:bg-stone-950/30'
                }`}
              >
                <div className="px-3 py-3 text-xs font-medium leading-snug text-stone-800 dark:text-stone-200 sm:px-6 sm:py-3.5 sm:text-sm">
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
              className="font-semibold text-primary-700 transition-colors hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
            >
              Ücretsiz hesapla başla →
            </Link>
          </p>
        </LandingReveal>
      </div>
    </section>
  );
}
