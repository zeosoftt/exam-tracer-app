/**
 * Next.js Middleware
 * Rate limiting, CORS, and security headers
 */

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applySecurityHeaders } from '@/lib/security/headers';
import { isPublicPath } from '@/lib/auth/publicRoutes';

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

    applySecurityHeaders(response);

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (isPublicPath(path)) {
          return true;
        }
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
