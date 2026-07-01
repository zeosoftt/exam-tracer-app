/**
 * Landing Page
 * Eğitim içeriği odaklı, yeni nesil UX/UI – responsive & mobil uyumlu
 */

import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { unstable_cache } from 'next/cache';
import { buildHomeJsonLd, buildHomeMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { getSettingBoolean, SITE_KEYS } from '@/lib/siteSettings';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingPainPoints } from '@/components/landing/LandingPainPoints';
import { LandingOutcomeStrip } from '@/components/landing/LandingOutcomeStrip';
import { LandingMidCta } from '@/components/landing/LandingMidCta';
import { LandingHeroVibe } from '@/components/landing/LandingHeroVibe';
import { LandingFreeVsPro } from '@/components/landing/LandingFreeVsPro';
import { LandingProductFeatures } from '@/components/landing/LandingProductFeatures';
import { LandingTrustSection } from '@/components/landing/LandingTrustSection';
import { LandingExamsStrip } from '@/components/landing/LandingExamsStrip';
import { LandingAudience } from '@/components/landing/LandingAudience';
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { LandingBenefits } from '@/components/landing/LandingBenefits';
import { LandingTestimonials } from '@/components/landing/LandingTestimonials';
import { LandingFinalCta } from '@/components/landing/LandingFinalCta';
import { MarketingFooter } from '@/components/layout/MarketingFooter';

const MobileLandingCta = dynamic(
  () => import('@/components/layout/MobileLandingCta').then((m) => ({ default: m.MobileLandingCta })),
  { ssr: false, loading: () => null },
);

const LandingScrollProgress = dynamic(
  () => import('@/components/landing/LandingScrollProgress').then((m) => ({ default: m.LandingScrollProgress })),
  { ssr: false, loading: () => null },
);

const LandingStickyCta = dynamic(
  () => import('@/components/landing/LandingStickyCta').then((m) => ({ default: m.LandingStickyCta })),
  { ssr: false, loading: () => null },
);

const getShowPartnersCached = () =>
  unstable_cache(
    async () => getSettingBoolean(SITE_KEYS.LANDING_SHOW_PARTNERS),
    ['site-setting-landing_show_partners'],
    { revalidate: 60 }
  )();

export const metadata: Metadata = buildHomeMetadata();

export default async function LandingPage() {
  const showPartners = await getShowPartnersCached();

  return (
    <div className="min-h-screen overflow-x-hidden bg-stone-50 pb-24 text-stone-900 dark:bg-stone-950 dark:text-stone-100 sm:pb-0">
      <JsonLd data={buildHomeJsonLd()} />
      <MarketingHeader />
      <LandingScrollProgress />

      <LandingHeroVibe />

      <LandingOutcomeStrip />
      <LandingPainPoints />
      <LandingFreeVsPro />

      <LandingTrustSection />
      <LandingExamsStrip />
      <LandingAudience />
      <LandingProductFeatures />
      <LandingHowItWorks />
      <LandingMidCta />
      <LandingPricing />
      <LandingBenefits />
      <LandingTestimonials />

      {/* Partners - admin panelden açılıp kapatılabilir */}
      {showPartners && (
        <section className="relative py-16 sm:py-24 lg:py-32">
          <div className="landing-dot-grid absolute inset-0 opacity-15 dark:opacity-[0.06]" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <LandingReveal>
              <div className="mb-10 text-center sm:mb-16">
                <p className="landing-section-eyebrow mb-3 text-xs font-bold tracking-[0.14em] text-primary-700 dark:text-primary-300">
                  ORTAKLAR
                </p>
                <h2 className="mb-3 font-display text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl">
                  Birlikte Çalıştığımız Kurumlar
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-stone-600 dark:text-stone-300">
                  Türkiye&apos;nin önde gelen kurumları sınav takiplerini The Goal Lab ile yönetiyor
                </p>
              </div>
            </LandingReveal>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
              {[
                { name: 'Milli Eğitim Bakanlığı', initials: 'MEB' },
                { name: 'Yükseköğretim Kurulu', initials: 'YÖK' },
                { name: 'ÖSYM', initials: 'ÖSYM' },
                { name: 'Kamu Personeli Seçme Kurumu', initials: 'KPSS' },
                { name: 'Adalet Bakanlığı', initials: 'ADL' },
                { name: 'Sağlık Bakanlığı', initials: 'SB' },
                { name: 'İçişleri Bakanlığı', initials: 'İB' },
                { name: 'Maliye Bakanlığı', initials: 'MB' },
              ].map((institution, index) => (
                <LandingReveal key={institution.initials} delay={index * 40}>
                  <div className="landing-glass-card landing-hover-lift group rounded-2xl p-6 sm:p-8">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 font-display text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-transform group-hover:scale-105 sm:mb-4 sm:h-16 sm:w-16 sm:text-lg">
                        {institution.initials}
                      </div>
                      <p className="text-xs font-semibold text-stone-600 transition-colors group-hover:text-stone-900 dark:text-stone-300 dark:group-hover:text-stone-100 sm:text-sm">
                        {institution.name}
                      </p>
                    </div>
                  </div>
                </LandingReveal>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-stone-500 dark:text-stone-400 sm:mt-12 sm:text-base">
              +100&apos;den fazla kamu kurumu ve özel eğitim kurumu The Goal Lab kullanıyor
            </p>
          </div>
        </section>
      )}

      <LandingFinalCta />

      <MarketingFooter />

      <MobileLandingCta />
      <LandingStickyCta />
    </div>
  );
}
