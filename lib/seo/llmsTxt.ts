/**
 * llms.txt / llms-full.txt — yapay zeka ajanları için site özeti (llmstxt.org uyumu).
 * @see https://llmstxt.org/
 */

import { getBaseUrl } from '@/lib/seo/baseUrl';
import { EXAM_SEO_ENTRIES } from '@/lib/seo/exams';
import { PUBLIC_FAQ_ITEMS } from '@/lib/seo/faqData';
import { SEO_DEFAULT_DESCRIPTION, SEO_SITE_NAME } from '@/lib/seo/siteSeo';

const PRODUCT_SUMMARY = `The Goal Lab (thegoallab.com) is a Turkish web application for exam preparation tracking. Users track subjects and topics, log practice exams (deneme), view progress dashboards, and (on Pro) get ÖSYM-aligned score previews for KPSS, ALES, YKS (TYT/AYT), DGS, ÖABT, and related exams. Free tier requires no credit card; registration takes about 2 minutes.`;

/** Kısa yol haritası — /llms.txt */
export function buildLlmsTxt(): string {
  const base = getBaseUrl();

  const examLines = EXAM_SEO_ENTRIES.map(
    (e) => `- [${e.name} — ${e.headline}](${base}/sinavlar#${e.id}): ${e.description}`,
  ).join('\n');

  return `# ${SEO_SITE_NAME}

> ${PRODUCT_SUMMARY}

${SEO_DEFAULT_DESCRIPTION}

## Temel sayfalar

- [Ana sayfa](${base}/): Ürün tanıtımı, özellikler, ücretsiz ve Pro plan özeti.
- [Desteklenen sınavlar](${base}/sinavlar): KPSS, ÖABT, ALES, YKS, DGS, YDS için konu ve deneme takibi açıklamaları.
- [Sıkça sorulan sorular](${base}/sss): Ücretsiz plan, desteklenen sınavlar, deneme/ÖSYM puanı, güvenlik, kurumsal kullanım.
- [Destek ve iletişim](${base}/destek): Teknik destek ve geri bildirim formu.
- [Ücretsiz kayıt](${base}/onboarding): Hesap oluşturma ve kurulum sihirbazı.

## Sınavlar (özet)

${examLines}

## Teknik

- [Sitemap](${base}/sitemap.xml): Dizine açık pazarlama URL listesi.
- [Robots](${base}/robots.txt): /dashboard ve /api dizinleri taranmaz; genel site taranabilir.
- [Tam bağlam (llms-full.txt)](${base}/llms-full.txt): Bu ürünün genişletilmiş Markdown özeti.

## Dizine kapalı (özet)

Giriş gerektiren panel (/dashboard), kimlik doğrulama (/auth) ve API uçları yapay zeka taraması için uygun değildir; robots.txt ile kısıtlanmıştır.
`;
}

/** Genişletilmiş tek dosya özeti — /llms-full.txt */
export function buildLlmsFullTxt(): string {
  const base = getBaseUrl();
  const faqBlock = PUBLIC_FAQ_ITEMS.map(({ q, a }) => `### ${q}\n\n${a}`).join('\n\n');
  const examBlock = EXAM_SEO_ENTRIES.map(
    (e) => `## ${e.name}\n\n**${e.headline}**\n\n${e.description}`,
  ).join('\n\n');

  return `# ${SEO_SITE_NAME} — tam bağlam

> ${PRODUCT_SUMMARY}

Canonical site: ${base}
Language: Turkish (tr-TR)
Category: Education technology / exam preparation SaaS

---

## What it does

- **Topic tracking (konu takibi):** Users define exams, subjects, and topics; mark progress with completion percentages.
- **Practice exams (deneme):** Pro users log mock exam results, nets, and trends; ÖSYM-aligned score preview where applicable.
- **Dashboard:** Weekly goals, progress bars, statistics for individuals; role-based views for institutions.
- **Pomodoro timer:** Study sessions integrated in the app (ancillary feature).
- **Plans:** Free tier for core tracking; Pro via Shopier for advanced deneme analytics.

## Supported exams

${examBlock}

## Frequently asked questions

${faqBlock}

## Public URLs (for citation)

| Page | URL |
|------|-----|
| Home | ${base}/ |
| Exams | ${base}/sinavlar |
| FAQ | ${base}/sss |
| Support | ${base}/destek |
| Sign up | ${base}/onboarding |

## Contact

Use the support form at ${base}/destek for product questions, billing (Pro), or institutional plans.

## Brand names

- Product: The Goal Lab
- Domain: thegoallab.com
- Also referenced as: thegoallab
`;
}
