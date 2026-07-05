/**
 * Super-admin route wrapper — oturum guard + merkezi hata/log.
 */

import type { NextRequest, NextResponse } from 'next/server';
import { guardAdminSession } from '@/lib/auth/requireSession';
import { handleError } from '@/lib/errors/errorHandler';
import { logError } from '@/lib/logger';

type AdminRouteHandler<T extends unknown[] = []> = (
  req: NextRequest,
  ...args: T
) => Promise<NextResponse>;

export function withAdminHandler<T extends unknown[] = []>(handler: AdminRouteHandler<T>) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const guard = await guardAdminSession();
    if (!guard.authorized) return guard.response;

    try {
      return await handler(req, ...args);
    } catch (error) {
      logError('Admin API error', error instanceof Error ? error : new Error(String(error)), {
        path: req.nextUrl.pathname,
        method: req.method,
      });
      return handleError(error);
    }
  };
}
