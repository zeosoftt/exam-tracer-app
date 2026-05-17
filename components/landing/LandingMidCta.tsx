import Link from 'next/link';
import { ArrowRight, Clock, Shield } from 'lucide-react';
import { LandingReveal } from '@/components/landing/LandingReveal';

/** Sayfa ortasında dönüşüm bandı — scroll sonrası görünür (LandingReveal). */
export function LandingMidCta() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <LandingReveal>
          <div className="relative overflow-hidden rounded-3xl border border-primary-200 bg-gradient-to-br from-primary-50 via-white to-amber-50/60 px-6 py-10 dark:border-primary-800 dark:from-primary-950/50 dark:via-stone-900 dark:to-stone-950 sm:px-10 sm:py-12">
            <div
              className="landing-orb pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-400/15 blur-3xl"
              aria-hidden
            />
            <div className="relative mx-auto max-w-2xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                Bugün başlayanlar yarın önde
              </p>
              <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
                İlk sınavınızı 2 dakikada kurun
              </h2>
              <p className="mt-3 text-base text-stone-600 dark:text-stone-300 sm:text-lg">
                Ücretsiz hesap açın, hedef sınavınızı seçin, ilk konuyu işaretleyin. Taahhüt veya kart yok.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/onboarding"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-700 to-primary-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-primary-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
                >
                  Ücretsiz hesap oluştur
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-stone-500 dark:text-stone-400 sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary-600" aria-hidden />
                  ~2 dk kurulum
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary-600" aria-hidden />
                  Kart gerekmez
                </span>
              </div>
            </div>
          </div>
        </LandingReveal>
      </div>
    </section>
  );
}
