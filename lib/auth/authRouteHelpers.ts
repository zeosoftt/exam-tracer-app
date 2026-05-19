/**
 * Auth API route ortak yardımcıları — rate limit + JSON yanıt tekrarını keser (DRY).
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleError } from '@/lib/errors/errorHandler';
import { HTTP_STATUS } from '@/config/constants';

export type AuthRateLimiter = (req: NextRequest) => NextResponse | null;

export function checkAuthRateLimit(req: NextRequest, limiter: AuthRateLimiter): NextResponse | null {
  return limiter(req);
}

export async function readAuthJsonBody<T = unknown>(req: NextRequest): Promise<T> {
  return req.json() as Promise<T>;
}

export function authJsonSuccess(body: Record<string, unknown>, status = HTTP_STATUS.OK): NextResponse {
  return NextResponse.json(body, { status });
}

export function authJsonError(message: string, status = HTTP_STATUS.BAD_REQUEST): NextResponse {
  return NextResponse.json({ error: { message } }, { status });
}

/** E-posta numaralandırma saldırılarına karşı nötr başarı yanıtı. */
export function authEnumerationSafe(message: string): NextResponse {
  return NextResponse.json({ success: true, message });
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
      return handleError(error);
    }
  };
}
