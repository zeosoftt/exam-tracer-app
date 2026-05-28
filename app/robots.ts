import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo/baseUrl';

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();
  let host: string | undefined;
  try {
    host = new URL(base).host;
  } catch {
    host = undefined;
  }

  const disallow = [
    '/dashboard',
    '/dashboard/',
    '/api/',
    '/auth/',
  ] as const;

  const publicAllow = ['/', '/sinavlar', '/sss', '/destek', '/onboarding', '/llms.txt', '/llms-full.txt'];

  /** Yapay zeka / LLM tarayıcıları — public sayfalar taranabilir (panel ve API kapalı). */
  const aiCrawlers = [
    'GPTBot',
    'ChatGPT-User',
    'OAI-SearchBot',
    'anthropic-ai',
    'ClaudeBot',
    'Claude-Web',
    'Google-Extended',
    'PerplexityBot',
    'Applebot-Extended',
    'cohere-ai',
    'Bytespider',
  ] as const;

  const aiRules = aiCrawlers.map((userAgent) => ({
    userAgent,
    allow: publicAllow,
    disallow: [...disallow],
  }));

  return {
    host,
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...disallow],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [...disallow],
      },
      ...aiRules,
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
