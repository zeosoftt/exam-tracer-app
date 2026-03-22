import type { Metadata } from 'next';
import { getBaseUrl } from '@/lib/seo/baseUrl';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const title = 'Ücretsiz kayıt — hesabını oluştur';
  const description =
    'The Goal Lab ile dakikalar içinde hesap oluşturun: bireysel veya kurumsal, sınav seçimi ve hedef puan. KPSS, ÖABT, ALES ve tüm sınavlar için konu takibi.';
  return {
    title,
    description,
    openGraph: {
      url: `${baseUrl}/onboarding`,
      title,
      description,
    },
    alternates: { canonical: `${baseUrl}/onboarding` },
    robots: { index: true, follow: true },
  };
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
