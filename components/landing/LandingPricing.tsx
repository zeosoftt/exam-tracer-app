import Link from 'next/link';
import dynamic from 'next/dynamic';
import { CheckCircle } from 'lucide-react';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader';

const ShopierCheckoutLink = dynamic(
  () => import('@/components/checkout/ShopierCheckoutLink').then((m) => m.ShopierCheckoutLink),
  { ssr: false, loading: () => null },
);

const FREE_FEATURES = [
  'Sınırsız sınav / ders / konu (politikaya tabi)',
  'İlerleme ve temel istatistikler',
  'Mobil uyumlu arayüz',
] as const;

const PRO_FEATURES = [
  'Ücretsiz plandaki her şey',
  'Deneme kaydı ve ÖSYM uyumlu puan hesaplama',
  'Net trendi ve gelişmiş deneme analizi',
] as const;

export function LandingPricing() {
  return (
    <section id="paketler" className="relative py-16 sm:py-20 lg:py-24">
      <div className="landing-vibe-mesh absolute inset-0 opacity-55 dark:opacity-35" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <LandingSectionHeader
          eyebrow="FİYATLANDIRMA"
          title="Ücretsiz başlayın, büyüdükçe Pro"
          description="Temel sınav ve konu takibi her zaman ücretsiz. Pro ve gelişmiş özellikler için ödeme güvenli şekilde Shopier üzerinden yapılır."
        />

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <LandingReveal>
            <div className="landing-glass-card landing-hover-lift flex h-full flex-col rounded-3xl p-5 sm:p-8">
              <p className="landing-section-eyebrow text-xs font-bold tracking-[0.12em] text-stone-500 dark:text-stone-400">
                ÜCRETSİZ
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-stone-900 dark:text-stone-100">0 ₺</p>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                Sınav, ders ve konu takibi; dashboard; deneme kayıtları.
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-stone-700 dark:text-stone-300">
                {FREE_FEATURES.map((line) => (
                  <li key={line} className="flex gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/onboarding"
                className="mt-8 inline-flex w-full items-center justify-center rounded-2xl border border-stone-300/80 bg-white/70 py-3.5 text-center text-sm font-bold text-stone-800 backdrop-blur-sm transition-colors hover:border-primary-400 hover:bg-primary-50/80 dark:border-stone-600 dark:bg-stone-900/70 dark:text-stone-100 dark:hover:border-primary-600"
              >
                Ücretsiz kayıt ol
              </Link>
            </div>
          </LandingReveal>

          <LandingReveal delay={80}>
            <div className="landing-vibe-glass landing-hover-lift relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-primary-500/80 p-5 shadow-lg shadow-primary-500/10 dark:border-primary-600 sm:p-8">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-400/20 blur-2xl" aria-hidden />
              <div className="absolute right-4 top-4 rounded-full bg-primary-800 px-2.5 py-0.5 text-xs font-bold text-white dark:bg-primary-700">
                Pro
              </div>
              <p className="landing-section-eyebrow text-xs font-bold tracking-[0.12em] text-primary-800 dark:text-primary-300">
                PROFESYONEL
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-stone-900 dark:text-stone-100">İhtiyaca göre</p>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                Deneme takibi, ÖSYM uyumlu puan hesaplama ve gelişmiş analitik.
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-stone-700 dark:text-stone-300">
                {PRO_FEATURES.map((line) => (
                  <li key={line} className="flex gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <ShopierCheckoutLink className="landing-vibe-cta mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 bg-[length:200%_100%] px-4 py-3.5 text-center text-xs font-bold leading-snug text-white shadow-lg shadow-primary-500/25 transition-transform hover:scale-[1.01] active:scale-[0.99] sm:px-6 sm:text-sm">
                Pro&apos;yu Shopier&apos;da satın al
              </ShopierCheckoutLink>
            </div>
          </LandingReveal>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-stone-500 dark:text-stone-400">
          Pro satın alma Shopier üzerinden tamamlanır. Ücretsiz hesap için kayıt yeterlidir; taahhüt yoktur.
        </p>
      </div>
    </section>
  );
}
