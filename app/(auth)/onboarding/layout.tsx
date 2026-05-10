import type { Metadata } from 'next';
import { buildPublicPageMetadata } from '@/lib/seo/siteSeo';
import { AuthThemeToggle } from '@/components/layout/AuthThemeToggle';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Ücretsiz kayıt — hesabını oluştur';
  const description =
    'The Goal Lab ile dakikalar içinde hesap oluşturun: bireysel veya kurumsal, sınav seçimi ve hedef puan. KPSS, ÖABT, ALES ve tüm sınavlar için konu takibi.';
  return buildPublicPageMetadata({ title, description, path: '/onboarding' });
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthThemeToggle />
      {children}
    </>
  );
}
