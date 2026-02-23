/**
 * Authorization Middleware
 * 
 * Middleware for protecting API routes with permission and plan limit checks
 * Follows Next.js App Router middleware pattern
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { authorize, getActiveOrganizationId } from '@/lib/auth/authorization';
import { hasFeatureAccess } from '@/lib/auth/planLimits';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors/AppError';
import { HTTP_STATUS } from '@/config/constants';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthorizationOptions {
  permission?: string;
  resourceType?: 'USERS' | 'EXAMS' | 'STUDENTS' | 'STORAGE';
  requireFeature?: string;
  scope?: 'OWN' | 'ORG' | 'SYSTEM';
  allowSuperAdmin?: boolean; // Super admin bypass (default: true)
}

// ============================================================================
// MIDDLEWARE HELPERS
// ============================================================================

/**
 * Get active organization ID from request
 * Priority:
 * 1. Header: x-organization-id
 * 2. Query param: organizationId
 * 3. User's personal organization or most recent membership
 */
async function getOrganizationFromRequest(req: NextRequest, userId: string): Promise<string | null> {
  // Check header
  const orgHeader = req.headers.get('x-organization-id');
  if (orgHeader) {
    return orgHeader;
  }

  // Check query param
  const { searchParams } = new URL(req.url);
  const orgQuery = searchParams.get('organizationId');
  if (orgQuery) {
    return orgQuery;
  }

  // Fallback to user's active organization
  return getActiveOrganizationId(userId);
}

/**
 * Create authorization middleware wrapper
 * 
 * Usage:
 * export const GET = withAuthorization(async (req, { userId, organizationId }) => {
 *   // Your handler logic
 * }, { permission: 'EXAM_VIEW' });
 */
export function withAuthorization<T extends unknown[] = unknown[]>(
  handler: (
    req: NextRequest,
    context: {
      userId: string;
      organizationId: string | null;
      session: Session;
    },
    ...args: T
  ) => Promise<NextResponse>,
  options: AuthorizationOptions = {}
): (req: NextRequest, ...args: T) => Promise<NextResponse> {
  return async (req: NextRequest, ...args: T) => {
    try {
      // 1. Check authentication
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        throw new UnauthorizedError();
      }

      const userId = session.user.id;
      const organizationId = await getOrganizationFromRequest(req, userId);

      // 2. Super admin bypass (if enabled)
      if (options.allowSuperAdmin !== false) {
        const { isSuperAdmin } = await import('@/lib/auth/authorization');
        if (await isSuperAdmin(userId)) {
          return handler(req, { userId, organizationId, session }, ...args);
        }
      }

      // 3. Check permission (if specified)
      if (options.permission) {
        const authResult = await authorize(
          userId,
          organizationId,
          options.permission,
          options.resourceType
        );

        if (!authResult.allowed) {
          throw new ForbiddenError(
            authResult.reason || `Permission denied: ${options.permission}`
          );
        }
      }

      // 4. Check feature access (if specified)
      if (options.requireFeature && organizationId) {
        const hasFeature = await hasFeatureAccess(organizationId, options.requireFeature);
        if (!hasFeature) {
          throw new ForbiddenError(
            `Feature not available in current plan: ${options.requireFeature}`
          );
        }
      }

      // 5. Execute handler
      return handler(req, { userId, organizationId, session }, ...args);
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: error instanceof UnauthorizedError ? HTTP_STATUS.UNAUTHORIZED : HTTP_STATUS.FORBIDDEN }
        );
      }

      throw error;
    }
  };
}

/**
 * Permission-based route protection
 * 
 * Usage:
 * export const GET = requirePermission('EXAM_VIEW', async (req, { userId, organizationId }) => {
 *   // Handler
 * });
 */
export function requirePermission(
  permission: string,
  options: Omit<AuthorizationOptions, 'permission'> = {}
) {
  return <T extends unknown[] = unknown[]>(
    handler: (
      req: NextRequest,
      context: { userId: string; organizationId: string | null; session: Session },
      ...args: T
    ) => Promise<NextResponse>
  ) => {
    return withAuthorization(handler, { ...options, permission });
  };
}

/**
 * Feature-based route protection
 * 
 * Usage:
 * export const GET = requireFeature('API_ACCESS', async (req, { userId, organizationId }) => {
 *   // Handler
 * });
 */
export function requireFeature(
  feature: string,
  options: Omit<AuthorizationOptions, 'requireFeature'> = {}
) {
  return <T extends unknown[] = unknown[]>(
    handler: (
      req: NextRequest,
      context: { userId: string; organizationId: string | null; session: Session },
      ...args: T
    ) => Promise<NextResponse>
  ) => {
    return withAuthorization(handler, { ...options, requireFeature: feature });
  };
}

/**
 * Combined permission + resource limit check
 * 
 * Usage:
 * export const POST = requirePermissionAndLimit(
 *   'EXAM_CREATE',
 *   'EXAMS',
 *   async (req, { userId, organizationId }) => {
 *     // Handler - will be blocked if exam limit exceeded
 *   }
 * );
 */
export function requirePermissionAndLimit(
  permission: string,
  resourceType: 'USERS' | 'EXAMS' | 'STUDENTS' | 'STORAGE',
  options: Omit<AuthorizationOptions, 'permission' | 'resourceType'> = {}
) {
  return <T extends unknown[] = unknown[]>(
    handler: (
      req: NextRequest,
      context: { userId: string; organizationId: string | null; session: Session },
      ...args: T
    ) => Promise<NextResponse>
  ) => {
    return withAuthorization(handler, { ...options, permission, resourceType });
  };
}

// ============================================================================
// UTILITY FUNCTIONS FOR HANDLERS
// ============================================================================

/**
 * Extract authorization context from request
 * Useful for handlers that need userId/organizationId but don't use middleware
 */
export async function getAuthContext(req: NextRequest): Promise<{
  userId: string;
  organizationId: string | null;
  session: Session;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  const userId = session.user.id;
  const organizationId = await getOrganizationFromRequest(req, userId);

  return { userId, organizationId, session };
}
