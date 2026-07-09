/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const { version: appVersion } = require('./package.json');
const sentryEnabled = Boolean(
  process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim(),
);

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
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https: https://*.ingest.sentry.io; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];
  },
};

module.exports = sentryEnabled
  ? require('@sentry/nextjs').withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      widenClientFileUpload: true,
      hideSourceMaps: true,
      disableLogger: true,
      automaticVercelMonitors: true,
      sourcemaps: {
        disable: !process.env.SENTRY_AUTH_TOKEN,
      },
    })
  : nextConfig;
