/**
 * Merkezi SEO: başlık, açıklama, OG/Twitter şablonları, kök metadata.
 */

import type { Metadata, Viewport } from 'next';
import { getBaseUrl } from '@/lib/seo/baseUrl';

export const SEO_SITE_NAME = 'The Goal Lab';

export const SEO_DEFAULT_TITLE =
  'The Goal Lab — KPSS, ALES, ÖABT Sınav ve Konu Takip Platformu';

export const SEO_DEFAULT_DESCRIPTION =
  'KPSS, ÖABT, ALES, DGS ve YKS için konu takibi, deneme kaydı ve ÖSYM uyumlu puan hesaplama. Ücretsiz başlayın — kredi kartı gerekmez.';

export const SEO_KEYWORDS = [
  'sınav takip',
  'hedef takip',
  'konu takibi',
  'deneme takibi',
  'KPSS takip',
  'ÖABT',
  'ALES',
  'DGS',
  'YKS',
  'TYT',
  'ÖSYM puan hesaplama',
  'sınav hazırlık',
  'The Goal Lab',
  'thegoallab',
  'eğitim teknolojisi',
  'dershane yazılımı',
] as const;

const OG_IMAGE = {
  url: '/opengraph-image' as const,
  width: 1200,
  height: 630,
};

/** Google Search Console — yalnızca env tanımlıysa */
export function getGoogleSiteVerification(): string | undefined {
  const v =
    process.env.GOOGLE_SITE_VERIFICATION?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  return v || undefined;
}

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

/** Google AdSense yayıncı kimliği — env ile geçersiz kılınabilir */
export const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || 'ca-pub-5570650174796895';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0a09' },
  ],
};

const DEFAULT_ROBOTS: Metadata['robots'] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

function buildOgTwitter(input: {
  title: string;
  description: string;
  url: string;
}): Pick<Metadata, 'openGraph' | 'twitter'> {
  return {
    openGraph: {
      type: 'website',
      locale: 'tr_TR',
      url: input.url,
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
  };
}

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
  const pageTitle = input.title;

  const verification = getGoogleSiteVerification();

  return {
    title: pageTitle,
    description: input.description,
    keywords: [...SEO_KEYWORDS],
    applicationName: SEO_SITE_NAME,
    category: 'education',
    ...buildOgTwitter({ title: pageTitle, description: input.description, url }),
    alternates: {
      canonical: url,
      languages: { 'tr-TR': url },
    },
    robots: DEFAULT_ROBOTS,
    ...(verification ? { verification: { google: verification } } : {}),
  };
}

/** Ana sayfa metadata */
export function buildHomeMetadata(): Metadata {
  const baseUrl = getBaseUrl();
  const verification = getGoogleSiteVerification();

  return {
    metadataBase: new URL(baseUrl),
    title: {
      absolute: SEO_DEFAULT_TITLE,
    },
    description: SEO_DEFAULT_DESCRIPTION,
    keywords: [...SEO_KEYWORDS],
    applicationName: SEO_SITE_NAME,
    authors: [{ name: SEO_SITE_NAME, url: baseUrl }],
    creator: SEO_SITE_NAME,
    publisher: SEO_SITE_NAME,
    category: 'education',
    formatDetection: { email: false, address: false, telephone: false },
    referrer: 'origin-when-cross-origin',
    ...buildOgTwitter({
      title: SEO_DEFAULT_TITLE,
      description: SEO_DEFAULT_DESCRIPTION,
      url: baseUrl,
    }),
    ...(verification ? { verification: { google: verification } } : {}),
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    },
    alternates: { canonical: baseUrl, languages: { 'tr-TR': baseUrl } },
    robots: DEFAULT_ROBOTS,
    appleWebApp: {
      capable: true,
      title: SEO_SITE_NAME,
      statusBarStyle: 'default',
    },
  };
}

export function buildRootMetadata(): Metadata {
  const baseUrl = getBaseUrl();
  const verification = getGoogleSiteVerification();

  return {
    metadataBase: new URL(baseUrl),
    title: { default: SEO_DEFAULT_TITLE, template: '%s | The Goal Lab' },
    description: SEO_DEFAULT_DESCRIPTION,
    keywords: [...SEO_KEYWORDS],
    applicationName: SEO_SITE_NAME,
    authors: [{ name: SEO_SITE_NAME, url: baseUrl }],
    creator: SEO_SITE_NAME,
    category: 'education',
    formatDetection: { email: false, address: false, telephone: false },
    referrer: 'origin-when-cross-origin',
    ...buildOgTwitter({
      title: SEO_DEFAULT_TITLE,
      description: SEO_DEFAULT_DESCRIPTION,
      url: baseUrl,
    }),
    ...(verification ? { verification: { google: verification } } : {}),
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      apple: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    },
    alternates: { canonical: baseUrl, languages: { 'tr-TR': baseUrl } },
    robots: DEFAULT_ROBOTS,
    appleWebApp: {
      capable: true,
      title: SEO_SITE_NAME,
      statusBarStyle: 'default',
    },
  };
}
