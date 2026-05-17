import type { Metadata } from 'next';
import { buildOnboardingJsonLd, buildPublicPageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { AuthThemeToggle } from '@/components/layout/AuthThemeToggle';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Ücretsiz kayıt — hesabını oluştur';
  const description =
    'The Goal Lab ile dakikalar içinde ücretsiz hesap: KPSS, ÖABT, ALES ve tüm sınavlar için konu takibi ve deneme analizi. Kredi kartı gerekmez.';
  return buildPublicPageMetadata({ title, description, path: '/onboarding' });
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={buildOnboardingJsonLd()} />
      <AuthThemeToggle />
      {children}
    </>
  );
}
