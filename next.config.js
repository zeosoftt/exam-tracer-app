/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const { version: appVersion } = require('./package.json');
const sentryEnabled = Boolean(
  process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim(),
);

/**
 * Content-Security-Policy.
 * - 'unsafe-eval' yalnızca dev (HMR / source map eval); üretim bundle'ı eval kullanmaz.
 * - 'unsafe-inline' script: GTM bootstrap + JSON-LD + next-themes inline script için gerekli;
 *   nonce tabanlı CSP'ye geçiş ayrı iş.
 * - object-src 'none': Flash/plugin gömülerini kapatır.
 */
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(isProd ? [] : ["'unsafe-eval'"]),
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
].join(' ');

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https: https://*.ingest.sentry.io",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  /** Cloudflare / özel CDN önünde statik chunk URL’leri için (örn. https://cdn.example.com) */
  assetPrefix: process.env.ASSET_PREFIX?.trim() || undefined,
  // Standalone output only for production builds
  ...(isProd && { output: 'standalone' }),
  ...(isProd && {
    compiler: {
      removeConsole: { exclude: ['error', 'warn'] },
    },
  }),
  images: {
    /**
     * Projede next/image kullanılmıyor. Image Optimization API'si Next 14.x'te yamalanmamış
     * RCE duyurularına (GHSA-2464-fhr4-w9xw, GHSA-2xp9-vwfh-vxw4) konu; uç nokta tamamen kapatılır.
     * next/image eklenecekse Next 15.5.24+ sürümüne geçip bu bayrağı kaldırın.
     */
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [],
  },
  experimental: {
    /** lucide tree-shake — çok ikonlu sayfalarda JS küçülür */
    optimizePackageImports: ['lucide-react', '@hookform/resolvers', 'react-hook-form', 'next-auth/react'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  /** Tarayıcıların varsayılan /favicon.ico isteği 404 vermesin */
  async redirects() {
    return [{ source: '/favicon.ico', destination: '/icon.svg', permanent: false }];
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // X-XSS-Protection kaldırıldı: modern tarayıcılarda kullanım dışı, eski sürümlerde
          // bilgi sızdırma vektörü olabiliyor; koruma CSP ile sağlanır.
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy,
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
};

module.exports = sentryEnabled
  ? require('@sentry/nextjs').withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: true,
      tunnelRoute: '/monitoring',
      sourcemaps: {
        disable: !process.env.SENTRY_AUTH_TOKEN,
      },
      release: {
        name: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
      },
      errorHandler: (err) => {
        console.warn('[Sentry] Build plugin:', err.message);
      },
      webpack: {
        automaticVercelMonitors: true,
        treeshake: {
          removeDebugLogging: true,
        },
      },
    })
  : nextConfig;
