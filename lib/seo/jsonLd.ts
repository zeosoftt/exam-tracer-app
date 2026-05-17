/**
 * Schema.org JSON-LD üreticileri
 */

import { PUBLIC_FAQ_ITEMS } from '@/lib/seo/faqData';
import { getBaseUrl } from '@/lib/seo/baseUrl';
import { getOrganizationSameAs, SEO_DEFAULT_DESCRIPTION, SEO_SITE_NAME } from '@/lib/seo/siteSeo';

type FaqItem = { q: string; a: string };

export function buildFaqPageEntity(items: readonly FaqItem[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function buildBreadcrumbJsonLd(
  crumbs: Array<{ name: string; path: string }>,
) {
  const base = getBaseUrl();
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(({ name, path }, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`,
    })),
  };
}

export function buildHomeJsonLd() {
  const base = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: base,
        name: SEO_SITE_NAME,
        description: SEO_DEFAULT_DESCRIPTION,
        inLanguage: 'tr-TR',
        publisher: { '@id': `${base}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${base}/#organization`,
        name: SEO_SITE_NAME,
        url: base,
        logo: {
          '@type': 'ImageObject',
          url: `${base}/icon.svg`,
          width: 512,
          height: 512,
        },
        sameAs: getOrganizationSameAs(),
      },
      {
        '@type': 'WebPage',
        '@id': `${base}/#webpage`,
        url: base,
        name: SEO_SITE_NAME,
        description: SEO_DEFAULT_DESCRIPTION,
        isPartOf: { '@id': `${base}/#website` },
        about: { '@id': `${base}/#software` },
        inLanguage: 'tr-TR',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${base}/#software`,
        name: SEO_SITE_NAME,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'TRY',
          availability: 'https://schema.org/InStock',
        },
        description:
          'Sınav ve konu takibi, hedef puan, deneme kaydı ve ÖSYM uyumlu puan hesaplama. KPSS, ÖABT, ALES, DGS, YKS için bireysel ve kurumsal kullanım.',
        featureList: [
          'Konu ve ders takibi',
          'Deneme kaydı ve net analizi',
          'Dashboard ve ilerleme istatistikleri',
          'KPSS, ALES, ÖABT sınav desteği',
        ],
      },
    ],
  };
}

export function buildSssJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildBreadcrumbJsonLd([
        { name: 'Ana sayfa', path: '/' },
        { name: 'Sıkça Sorulan Sorular', path: '/sss' },
      ]),
      buildFaqPageEntity(PUBLIC_FAQ_ITEMS),
    ],
  };
}

export function buildDestekJsonLd() {
  const base = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildBreadcrumbJsonLd([
        { name: 'Ana sayfa', path: '/' },
        { name: 'Destek', path: '/destek' },
      ]),
      {
        '@type': 'ContactPage',
        url: `${base}/destek`,
        name: 'Destek ve iletişim — The Goal Lab',
        isPartOf: { '@type': 'WebSite', name: SEO_SITE_NAME, url: base },
        inLanguage: 'tr-TR',
      },
    ],
  };
}

export function buildOnboardingJsonLd() {
  const base = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildBreadcrumbJsonLd([
        { name: 'Ana sayfa', path: '/' },
        { name: 'Kayıt', path: '/onboarding' },
      ]),
      {
        '@type': 'WebPage',
        url: `${base}/onboarding`,
        name: 'Ücretsiz kayıt — The Goal Lab',
        description:
          'Dakikalar içinde ücretsiz hesap oluşturun; sınav seçimi ve konu takibine başlayın.',
        isPartOf: { '@type': 'WebSite', name: SEO_SITE_NAME, url: base },
        inLanguage: 'tr-TR',
      },
    ],
  };
}
