/**
 * Next.js Middleware — güvenlik başlıkları, API 401 JSON, login rate limit.
 */

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { applySecurityHeaders } from '@/lib/security/headers';
import { isPublicPath } from '@/lib/auth/publicRoutes';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { RATE_LIMIT, ERROR_MESSAGES, HTTP_STATUS } from '@/config/constants';

const loginRateLimiter = rateLimit(RATE_LIMIT.LOGIN_MAX_REQUESTS, RATE_LIMIT.LOGIN_WINDOW_MS);

function isNextAuthSignIn(req: NextRequest): boolean {
  return (
    req.method === 'POST' &&
    req.nextUrl.pathname.startsWith('/api/auth') &&
    (req.nextUrl.pathname.includes('callback/credentials') ||
      req.nextUrl.pathname.endsWith('/signin/credentials'))
  );
}

export default withAuth(
  async function middleware(req: NextRequest) {
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

    if (isNextAuthSignIn(req)) {
      const limited = loginRateLimiter(req);
      if (limited) return limited;
    }

    const path = req.nextUrl.pathname;
    if (path.startsWith('/api/') && !isPublicPath(path)) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (!token?.sub && !token?.id) {
        const res = NextResponse.json(
          { success: false, message: ERROR_MESSAGES.UNAUTHORIZED, errors: [] },
          { status: HTTP_STATUS.UNAUTHORIZED },
        );
        return applySecurityHeaders(res);
      }
    }

    const response = NextResponse.next();

    const accept = req.headers.get('accept') ?? '';
    const isHtmlDocument =
      req.method === 'GET' &&
      accept.includes('text/html') &&
      !path.startsWith('/api/');

    // bfcache: no-store / Pragma / Expires geri-ileri önbelleği engeller.
    // Oturum tazeliği ProtectedSessionGuard (pageshow) ile korunur.
    if (isHtmlDocument) {
      response.headers.set('Cache-Control', 'private, max-age=0, must-revalidate');
      response.headers.delete('Pragma');
      response.headers.delete('Expires');
    }

    const origin = req.headers.get('origin');
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    return applySecurityHeaders(response);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (isPublicPath(path)) return true;
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|robots\\.txt|sitemap\\.xml|llms\\.txt|llms-full\\.txt|manifest\\.webmanifest|opengraph-image).*)',
  ],
};
