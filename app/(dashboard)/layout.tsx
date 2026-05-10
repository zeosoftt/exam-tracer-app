import type { Metadata } from 'next';

/**
 * Uygulama içi sayfalar arama indeksine açılmamalı (gizlilik + tarama bütçesi).
 */
export const metadata: Metadata = {
  title: { template: '%s | The Goal Lab', default: 'Panel' },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
