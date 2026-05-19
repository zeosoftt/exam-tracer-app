/**
 * Authorization Middleware
 *
 * API route koruması: oturum `requireSession`, izin/plan `lib/auth/authorization`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authorize, getActiveOrganizationId } from '@/lib/auth/authorization';
import { hasFeatureAccess } from '@/lib/auth/planLimits';
import {
  requireSession,
  getSessionUserId,
  toAuthErrorResponse,
  type AuthenticatedSession,
} from '@/lib/auth/requireSession';
import { ForbiddenError } from '@/lib/errors/AppError';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthorizationOptions {
  permission?: string;
  resourceType?: 'USERS' | 'EXAMS' | 'STUDENTS' | 'STORAGE';
  requireFeature?: string;
  scope?: 'OWN' | 'ORG' | 'SYSTEM';
  allowSuperAdmin?: boolean;
}

export type AuthRouteContext = {
  userId: string;
  organizationId: string | null;
  session: AuthenticatedSession;
};

// ============================================================================
// MIDDLEWARE HELPERS
// ============================================================================

/**
 * Aktif organizasyon ID — öncelik: header → query → kullanıcı varsayılanı
 */
export async function getOrganizationFromRequest(req: NextRequest, userId: string): Promise<string | null> {
  const orgHeader = req.headers.get('x-organization-id');
  if (orgHeader) {
    return orgHeader;
  }

  const { searchParams } = new URL(req.url);
  const orgQuery = searchParams.get('organizationId');
  if (orgQuery) {
    return orgQuery;
  }

  return getActiveOrganizationId(userId);
}

/** Oturum + organizasyon bağlamı (handler veya middleware öncesi). */
export async function getAuthContext(req: NextRequest): Promise<AuthRouteContext> {
  const session = await requireSession();
  const userId = getSessionUserId(session);
  const organizationId = await getOrganizationFromRequest(req, userId);
  return { userId, organizationId, session };
}

/**
 * İzin / plan kontrollü route sarmalayıcı
 *
 * @example
 * export const GET = withAuthorization(async (req, { userId, organizationId }) => {
 *   // ...
 * }, { permission: 'EXAM_VIEW' });
 */
export function withAuthorization<T extends unknown[] = unknown[]>(
  handler: (req: NextRequest, context: AuthRouteContext, ...args: T) => Promise<NextResponse>,
  options: AuthorizationOptions = {},
): (req: NextRequest, ...args: T) => Promise<NextResponse> {
  return async (req: NextRequest, ...args: T) => {
    try {
      const { userId, organizationId, session } = await getAuthContext(req);

      if (options.allowSuperAdmin !== false) {
        const { isSuperAdmin } = await import('@/lib/auth/authorization');
        if (await isSuperAdmin(userId)) {
          return handler(req, { userId, organizationId, session }, ...args);
        }
      }

      if (options.permission) {
        const authResult = await authorize(userId, organizationId, options.permission, options.resourceType);

        if (!authResult.allowed) {
          throw new ForbiddenError(authResult.reason || `Permission denied: ${options.permission}`);
        }
      }

      if (options.requireFeature && organizationId) {
        const hasFeature = await hasFeatureAccess(organizationId, options.requireFeature);
        if (!hasFeature) {
          throw new ForbiddenError(`Feature not available in current plan: ${options.requireFeature}`);
        }
      }

      return handler(req, { userId, organizationId, session }, ...args);
    } catch (error) {
      const response = toAuthErrorResponse(error);
      if (response) {
        return response;
      }
      throw error;
    }
  };
}

export function requirePermission(permission: string, options: Omit<AuthorizationOptions, 'permission'> = {}) {
  return <T extends unknown[] = unknown[]>(
    handler: (req: NextRequest, context: AuthRouteContext, ...args: T) => Promise<NextResponse>,
  ) => withAuthorization(handler, { ...options, permission });
}

export function requireFeature(feature: string, options: Omit<AuthorizationOptions, 'requireFeature'> = {}) {
  return <T extends unknown[] = unknown[]>(
    handler: (req: NextRequest, context: AuthRouteContext, ...args: T) => Promise<NextResponse>,
  ) => withAuthorization(handler, { ...options, requireFeature: feature });
}

export function requirePermissionAndLimit(
  permission: string,
  resourceType: 'USERS' | 'EXAMS' | 'STUDENTS' | 'STORAGE',
  options: Omit<AuthorizationOptions, 'permission' | 'resourceType'> = {},
) {
  return <T extends unknown[] = unknown[]>(
    handler: (req: NextRequest, context: AuthRouteContext, ...args: T) => Promise<NextResponse>,
  ) => withAuthorization(handler, { ...options, permission, resourceType });
}
