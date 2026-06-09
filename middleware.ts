/**
 * Next.js Middleware
 * Rate limiting, CORS, and security headers
 */

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth(
  function middleware(req: NextRequest) {
    /** Kendi sunucunuzda TLS sonlandırma arkasında HTTP kalırsa (Vercel’de gerekmez) */
    if (process.env.FORCE_HTTPS_REDIRECT === 'true') {
      const host = req.headers.get('host') ?? '';
      const local = host.startsWith('localhost') || host.startsWith('127.0.0.1');
      if (!local) {
        const proto = req.headers.get('x-forwarded-proto');
        if (proto === 'http') {
          const url = req.nextUrl.clone();
          url.protocol = 'https:';
          return NextResponse.redirect(url, 308);
        }
      }
    }

    // Add security headers
    const response = NextResponse.next();

    // Korumalı sayfalar önbelleğe alınmasın (çıkış sonrası geri tuşu / bfcache)
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    }
    
    // CORS headers (adjust for production)
    const origin = req.headers.get('origin');
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public routes that don't require authentication
        const path = req.nextUrl.pathname;

        /** Sitemap / robots / manifest / ikon / OG — oturum olmadan erişilebilir olmalı (Google, sosyal önizleme) */
        if (
          path === '/icon.svg' ||
          path === '/robots.txt' ||
          path === '/sitemap.xml' ||
          path === '/llms.txt' ||
          path === '/llms-full.txt' ||
          path === '/manifest.webmanifest' ||
          path === '/opengraph-image' ||
          path.startsWith('/opengraph-image/')
        ) {
          return true;
        }

        const publicPaths = [
          '/',
          '/auth/login',
          '/auth/register',
          '/auth/verify-email',
          '/auth/forgot-password',
          '/auth/reset-password',
          '/onboarding',
          '/destek',
          '/sinavlar',
          '/sss',
          '/api/auth',
          '/api/auth/dev-verification-code',
          '/api/health',
          '/api/exams/available',
          '/api/support',
          '/api/analytics',
        ];

        if (publicPaths.some((p) => path === p || path.startsWith(p))) {
          return true;
        }

        // Protected routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * withAuth dışında bırakılanlar (SEO + önizleme):
     * robots, sitemap, manifest, ikon, OG görseli — oturumsuz istekte yönlendirme/401 olmasın.
     */
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|robots\\.txt|sitemap\\.xml|llms\\.txt|llms-full\\.txt|manifest\\.webmanifest|opengraph-image).*)',
  ],
};
