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
import { LandingOutcomeStrip } from '@/components/landing/LandingOutcomeStrip';
import { LandingHeroVibe } from '@/components/landing/LandingHeroVibe';
import { LandingPainPoints } from '@/components/landing/LandingPainPoints';
import { LandingFreeVsPro } from '@/components/landing/LandingFreeVsPro';

const LandingTrustSection = dynamic(() =>
  import('@/components/landing/LandingTrustSection').then((m) => m.LandingTrustSection),
);
const LandingExamsStrip = dynamic(() =>
  import('@/components/landing/LandingExamsStrip').then((m) => m.LandingExamsStrip),
);
const LandingAudience = dynamic(() =>
  import('@/components/landing/LandingAudience').then((m) => m.LandingAudience),
);
const LandingProductFeatures = dynamic(() =>
  import('@/components/landing/LandingProductFeatures').then((m) => m.LandingProductFeatures),
);
const LandingHowItWorks = dynamic(() =>
  import('@/components/landing/LandingHowItWorks').then((m) => m.LandingHowItWorks),
);
const LandingMidCta = dynamic(() =>
  import('@/components/landing/LandingMidCta').then((m) => m.LandingMidCta),
);
const LandingPricing = dynamic(() =>
  import('@/components/landing/LandingPricing').then((m) => m.LandingPricing),
);
const LandingBenefits = dynamic(() =>
  import('@/components/landing/LandingBenefits').then((m) => m.LandingBenefits),
);
const LandingTestimonials = dynamic(() =>
  import('@/components/landing/LandingTestimonials').then((m) => m.LandingTestimonials),
);
const LandingPartners = dynamic(() =>
  import('@/components/landing/LandingPartners').then((m) => m.LandingPartners),
);
const LandingFinalCta = dynamic(() =>
  import('@/components/landing/LandingFinalCta').then((m) => m.LandingFinalCta),
);
const MarketingFooter = dynamic(() =>
  import('@/components/layout/MarketingFooter').then((m) => m.MarketingFooter),
);

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

const LandingPageAnalytics = dynamic(
  () => import('@/components/marketing/LandingPageAnalytics').then((m) => m.LandingPageAnalytics),
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
      <LandingPageAnalytics />
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
