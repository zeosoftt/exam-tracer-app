import type { Metadata } from 'next';
import { AuthThemeToggle } from '@/components/layout/AuthThemeToggle';
import { AuthPageFooter } from '@/components/layout/AuthPageFooter';

/**
 * Giriş, kayıt, şifre sıfırlama vb. — indekslenmesin (ince içerik, tarama bütçesi).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AuthThemeToggle />
      <div className="flex flex-1 flex-col">{children}</div>
      <AuthPageFooter />
    </div>
  );
}
