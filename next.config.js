/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
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
    optimizePackageImports: ['lucide-react'],
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
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];
  },
};

module.exports = nextConfig;
