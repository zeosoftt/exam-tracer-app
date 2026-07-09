/**
 * Super-admin route wrapper — oturum guard + merkezi hata/log + audit.
 */

import type { NextRequest, NextResponse } from 'next/server';
import { guardAdminSession } from '@/lib/auth/requireSession';
import { handleError } from '@/lib/errors/errorHandler';
import { logError } from '@/lib/logger';
import { writeAuditLog } from '@/lib/audit/writeAuditLog';

type AdminRouteHandler<T extends unknown[] = []> = (
  req: NextRequest,
  ...args: T
) => Promise<NextResponse>;

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function withAdminHandler<T extends unknown[] = []>(
  handler: AdminRouteHandler<T>,
  auditAction?: string,
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const guard = await guardAdminSession();
    if (!guard.authorized) return guard.response;

    try {
      const response = await handler(req, ...args);
      if (
        auditAction &&
        MUTATING.has(req.method) &&
        response.status >= 200 &&
        response.status < 300
      ) {
        await writeAuditLog({
          actorId: guard.session.user.id,
          action: auditAction,
          resource: req.nextUrl.pathname,
          req,
        });
      }
      return response;
    } catch (error) {
      logError('Admin API error', error instanceof Error ? error : new Error(String(error)), {
        path: req.nextUrl.pathname,
        method: req.method,
      });
      return handleError(error);
    }
  };
}
