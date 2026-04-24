import type { Metadata } from 'next';
import { AuthThemeToggle } from '@/components/layout/AuthThemeToggle';

/**
 * Giriş, kayıt, şifre sıfırlama vb. — indekslenmesin (ince içerik, tarama bütçesi).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthThemeToggle />
      {children}
    </>
  );
}
