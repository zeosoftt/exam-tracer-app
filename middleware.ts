/**
 * Next.js Middleware
 * Rate limiting, CORS, and security headers
 */

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth(
  function middleware(req: NextRequest) {
    // Add security headers
    const response = NextResponse.next();
    
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
          '/sss',
          '/api/auth',
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
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|opengraph-image).*)',
  ],
};
