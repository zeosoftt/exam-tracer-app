import type { Metadata } from 'next';

/**
 * Giriş, kayıt, şifre sıfırlama vb. — indekslenmesin (ince içerik, tarama bütçesi).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
