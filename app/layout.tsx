/**
 * Root Layout
 * Global layout with error boundary
 */

import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { getBaseUrl } from '@/lib/seo/baseUrl';
import './globals.css';
import { Providers } from './providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
const GA_MEASUREMENT_ID = 'G-6YZFCN5KML';

const baseUrl = getBaseUrl();
const defaultTitle = 'The Goal Lab - Sınav ve Hedef Takip';
const defaultDescription = 'thegoallab - Kurumlar ve bireyler için hedef ve sınav takip platformu. KPSS, ÖABT, ALES sınav hazırlığı.';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: defaultTitle, template: '%s | The Goal Lab' },
  description: defaultDescription,
  keywords: ['sınav takip', 'hedef takip', 'KPSS', 'ÖABT', 'ALES', 'The Goal Lab', 'thegoallab', 'sınav hazırlık', 'konu takip'],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: baseUrl,
    siteName: 'The Goal Lab',
    title: defaultTitle,
    description: defaultDescription,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: defaultTitle }],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: [`${baseUrl}/opengraph-image`],
  },
  verification: {
    google: 'gRq38B6komUBMFH4YMw8vymDABn23I649wrmMowDUKc',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  alternates: { canonical: baseUrl },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
