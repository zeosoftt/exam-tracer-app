/**
 * Auth API route ortak yardımcıları — rate limit + standart JSON yanıt.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  authFailureFromError,
  authMessage,
  authSuccess,
  authFailure,
} from '@/lib/auth/responses';
import { HTTP_STATUS } from '@/config/constants';

export type AuthRateLimiter = (req: NextRequest) => NextResponse | null;

export function checkAuthRateLimit(req: NextRequest, limiter: AuthRateLimiter): NextResponse | null {
  return limiter(req);
}

export async function readAuthJsonBody<T = unknown>(req: NextRequest): Promise<T> {
  return req.json() as Promise<T>;
}

/** @deprecated authSuccess / authMessage kullanın */
export function authJsonSuccess(body: Record<string, unknown>, status = HTTP_STATUS.OK): NextResponse {
  return authSuccess(body, status);
}

/** @deprecated authFailure kullanın */
export function authJsonError(message: string, status = HTTP_STATUS.BAD_REQUEST): NextResponse {
  return authFailure(message, status);
}

/** E-posta numaralandırma saldırılarına karşı nötr başarı yanıtı. */
export function authEnumerationSafe(message: string): NextResponse {
  return authMessage(message);
}

export function wrapAuthPostHandler(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: { limiter?: AuthRateLimiter },
): (req: NextRequest) => Promise<NextResponse> {
  return async (req) => {
    if (options?.limiter) {
      const limited = options.limiter(req);
      if (limited) return limited;
    }
    try {
      return await handler(req);
    } catch (error) {
      return authFailureFromError(error);
    }
  };
}

export function wrapAuthGetHandler(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: { limiter?: AuthRateLimiter },
): (req: NextRequest) => Promise<NextResponse> {
  return wrapAuthPostHandler(handler, options);
}
