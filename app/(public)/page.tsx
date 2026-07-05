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
import { LandingPartners } from '@/components/landing/LandingPartners';
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

      {showPartners ? <LandingPartners /> : null}

      <LandingFinalCta />

      <MarketingFooter />

      <MobileLandingCta />
      <LandingStickyCta />
    </div>
  );
}
