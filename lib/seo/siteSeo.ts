/**
 * Merkezi SEO: başlık, açıklama, OG/Twitter şablonları, kök metadata.
 */

import type { Metadata, Viewport } from 'next';
import { getBaseUrl } from '@/lib/seo/baseUrl';

export const SEO_SITE_NAME = 'The Goal Lab';

export const SEO_DEFAULT_TITLE = 'The Goal Lab - Sınav ve Hedef Takip';

export const SEO_DEFAULT_DESCRIPTION =
  'thegoallab — Kurumlar ve bireyler için hedef ve sınav takip platformu. KPSS, ÖABT, ALES sınav hazırlığı, konu takibi ve deneme analizi.';

export const SEO_KEYWORDS = [
  'sınav takip',
  'hedef takip',
  'KPSS',
  'ÖABT',
  'ALES',
  'The Goal Lab',
  'thegoallab',
  'sınav hazırlık',
  'konu takip',
  'deneme takibi',
  'eğitim teknolojisi',
] as const;

const OG_IMAGE = {
  url: '/opengraph-image' as const,
  width: 1200,
  height: 630,
};

/** Google Search Console doğrulama (env ile geçersiz kılınabilir) */
export const GOOGLE_SITE_VERIFICATION =
  process.env.GOOGLE_SITE_VERIFICATION?.trim() ||
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ||
  'gRq38B6komUBMFH4YMw8vymDABn23I649wrmMowDUKc';

/** Organization sameAs — virgülle ayrılmış URL listesi veya varsayılan */
export function getOrganizationSameAs(): string[] {
  const raw = process.env.ORGANIZATION_SAME_AS?.trim();
  if (raw) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter((u) => u.startsWith('http'));
  }
  return ['https://www.instagram.com/zeosoft.io'];
}

export const GA_MEASUREMENT_ID = 'G-6YZFCN5KML';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0a09' },
  ],
};

/**
 * Pazarlama / bilgi sayfaları için tutarlı OG + Twitter + canonical + hreflang (tr-TR).
 */
export function buildPublicPageMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const base = getBaseUrl();
  const path = input.path.startsWith('/') ? input.path : `/${input.path}`;
  const url = `${base}${path}`;

  return {
    title: input.title,
    description: input.description,
    keywords: [...SEO_KEYWORDS],
    applicationName: SEO_SITE_NAME,
    openGraph: {
      type: 'website',
      locale: 'tr_TR',
      url,
      siteName: SEO_SITE_NAME,
      title: input.title,
      description: input.description,
      images: [{ ...OG_IMAGE, alt: input.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [OG_IMAGE.url],
    },
    alternates: {
      canonical: url,
      languages: { 'tr-TR': url },
    },
    robots: { index: true, follow: true },
  };
}

export function buildRootMetadata(): Metadata {
  const baseUrl = getBaseUrl();
  return {
    metadataBase: new URL(baseUrl),
    title: { default: SEO_DEFAULT_TITLE, template: '%s | The Goal Lab' },
    description: SEO_DEFAULT_DESCRIPTION,
    keywords: [...SEO_KEYWORDS],
    applicationName: SEO_SITE_NAME,
    authors: [{ name: SEO_SITE_NAME, url: baseUrl }],
    creator: SEO_SITE_NAME,
    formatDetection: { email: false, address: false, telephone: false },
    referrer: 'origin-when-cross-origin',
    openGraph: {
      type: 'website',
      locale: 'tr_TR',
      url: baseUrl,
      siteName: SEO_SITE_NAME,
      title: SEO_DEFAULT_TITLE,
      description: SEO_DEFAULT_DESCRIPTION,
      images: [{ ...OG_IMAGE, alt: SEO_DEFAULT_TITLE }],
    },
    twitter: {
      card: 'summary_large_image',
      title: SEO_DEFAULT_TITLE,
      description: SEO_DEFAULT_DESCRIPTION,
      images: [OG_IMAGE.url],
    },
    verification: { google: GOOGLE_SITE_VERIFICATION },
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: 'any' },
      ],
      apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    },
    alternates: { canonical: baseUrl, languages: { 'tr-TR': baseUrl } },
    robots: { index: true, follow: true },
    appleWebApp: {
      capable: true,
      title: SEO_SITE_NAME,
      statusBarStyle: 'default',
    },
  };
}
