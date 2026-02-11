/**
 * Multi-Tenant Authorization Service
 * 
 * Production-ready RBAC + Permission-based authorization system
 * Supports multi-tenant architecture with organization-based access control
 * 
 * Architecture:
 * - User → Membership → Organization → Role → Permissions
 * - Plans control feature access and limits
 * - Authorization = hasPermission AND planAllowsFeature
 */

import { prisma } from '@/lib/db/prisma';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthorizationContext {
  userId: string;
  organizationId: string | null;
  activeMembershipId?: string;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  hasPermission?: boolean;
  planAllows?: boolean;
  planLimitExceeded?: boolean;
}

export interface PlanLimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  reason?: string;
  planLimitExceeded?: boolean;
}

// ============================================================================
// CORE AUTHORIZATION FUNCTIONS
// ============================================================================

/**
 * Check if user has permission in organization
 * 
 * @param userId - User ID
 * @param organizationId - Organization ID (null for system-wide)
 * @param permissionCode - Permission code (e.g., "EXAM_CREATE")
 * @param context - Optional context for scope-based permissions
 * @returns Authorization result
 */
export async function canAccess(
  userId: string,
  organizationId: string | null,
  permissionCode: string,
  context?: {
    resourceId?: string;
    resourceOwnerId?: string;
    scope?: 'OWN' | 'ORG' | 'SYSTEM';
  }
): Promise<PermissionCheckResult> {
  try {
    // SUPER_ADMIN bypass (system-wide admin)
    const superAdminRole = await prisma.role.findUnique({
      where: { code: 'SYSTEM_ROLE_SUPER_ADMIN' },
    });

    if (superAdminRole) {
      const isSuperAdmin = await prisma.membership.findFirst({
        where: {
          userId,
          roleId: superAdminRole.id,
          isActive: true,
          deletedAt: null,
        },
      });

      if (isSuperAdmin) {
        return {
          allowed: true,
          hasPermission: true,
          planAllows: true,
        };
      }
    }

    // Get user's membership in organization
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        organizationId: organizationId || undefined,
        isActive: true,
        deletedAt: null,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return {
        allowed: false,
        hasPermission: false,
        reason: `User is not a member of organization ${organizationId}`,
      };
    }

    // Check if role has permission
    const hasPermission = membership.role.permissions.some(
      (rp) => rp.permission.code === permissionCode && !rp.permission.deletedAt
    );

    if (!hasPermission) {
      return {
        allowed: false,
        hasPermission: false,
        reason: `Role ${membership.role.code} does not have permission ${permissionCode}`,
      };
    }

    // Check context-based permissions (e.g., OWN scope)
    if (context?.scope === 'OWN' && context.resourceOwnerId && context.resourceOwnerId !== userId) {
      return {
        allowed: false,
        hasPermission: false,
        reason: 'Permission requires ownership of resource',
      };
    }

    // Permission granted
    return {
      allowed: true,
      hasPermission: true,
    };
  } catch (error) {
    console.error('Authorization check failed:', error);
    return {
      allowed: false,
      hasPermission: false,
      reason: 'Authorization check failed',
    };
  }
}

/**
 * Check if user has specific role in organization
 * 
 * @param userId - User ID
 * @param organizationId - Organization ID
 * @param roleCode - Role code (e.g., "SYSTEM_ROLE_ADMIN")
 * @returns True if user has role
 */
export async function hasRole(
  userId: string,
  organizationId: string | null,
  roleCode: string
): Promise<boolean> {
  const role = await prisma.role.findUnique({
    where: { code: roleCode },
  });

  if (!role) {
    return false;
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      organizationId: organizationId || undefined,
      roleId: role.id,
      isActive: true,
      deletedAt: null,
    },
  });

  return !!membership;
}

/**
 * Get user's active memberships with roles and permissions
 * 
 * @param userId - User ID
 * @returns Array of memberships with full role and permission details
 */
export async function getUserMemberships(userId: string) {
  return prisma.membership.findMany({
    where: {
      userId,
      isActive: true,
      deletedAt: null,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          isPersonal: true,
        },
      },
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
    orderBy: {
      joinedAt: 'desc',
    },
  });
}

/**
 * Get user's permissions in organization (cached)
 * 
 * @param userId - User ID
 * @param organizationId - Organization ID
 * @returns Array of permission codes
 */
export async function getUserPermissions(
  userId: string,
  organizationId: string | null
): Promise<string[]> {
  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      organizationId: organizationId || undefined,
      isActive: true,
      deletedAt: null,
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!membership) {
    return [];
  }

  return membership.role.permissions
    .filter((rp) => !rp.permission.deletedAt)
    .map((rp) => rp.permission.code);
}

// ============================================================================
// PLAN LIMIT CHECKS
// ============================================================================

/**
 * Check if organization can use a feature based on plan
 * 
 * @param organizationId - Organization ID
 * @param featureCode - Feature code (e.g., "API_ACCESS")
 * @returns True if feature is available in plan
 */
export async function canUseFeature(
  organizationId: string,
  featureCode: string
): Promise<boolean> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      subscriptions: {
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          currentPeriodEnd: {
            gte: new Date(),
          },
        },
        include: {
          plan: {
            include: {
              planFeatures: {
                include: {
                  feature: true,
                },
              },
            },
          },
        },
        orderBy: {
          currentPeriodEnd: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!organization) {
    return false;
  }

  // Get active subscription
  const activeSubscription = organization.subscriptions[0];
  if (!activeSubscription) {
    // No active subscription, check if organization has a plan
    if (!organization.currentPlanId) {
      return false;
    }

    // Check plan features directly
    const plan = await prisma.plan.findUnique({
      where: { id: organization.currentPlanId },
      include: {
        planFeatures: {
          include: {
            feature: true,
          },
        },
      },
    });

    if (!plan) {
      return false;
    }

    return plan.planFeatures.some(
      (pf) => pf.feature.code === featureCode && !pf.feature.deletedAt
    );
  }

  // Check if plan has feature
  return activeSubscription.plan.planFeatures.some(
    (pf) => pf.feature.code === featureCode && !pf.feature.deletedAt
  );
}

/**
 * Check if organization has exceeded plan limit for a resource
 * 
 * @param organizationId - Organization ID
 * @param resourceType - Resource type ("USERS", "EXAMS", "STUDENTS")
 * @returns Limit check result
 */
export async function checkPlanLimit(
  organizationId: string,
  resourceType: 'USERS' | 'EXAMS' | 'STUDENTS' | 'STORAGE'
): Promise<PlanLimitCheckResult> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      subscriptions: {
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          currentPeriodEnd: {
            gte: new Date(),
          },
        },
        include: {
          plan: true,
        },
        orderBy: {
          currentPeriodEnd: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!organization) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      reason: 'Organization not found',
    };
  }

  // Get plan limits (from subscription or organization's cached plan)
  let limit = 0;
  const activeSubscription = organization.subscriptions[0];

  if (activeSubscription) {
    const plan = activeSubscription.plan;
    switch (resourceType) {
      case 'USERS':
        limit = plan.maxUsers;
        break;
      case 'EXAMS':
        limit = plan.maxExams;
        break;
      case 'STUDENTS':
        limit = plan.maxStudents;
        break;
      case 'STORAGE':
        limit = plan.maxStorage ?? Infinity;
        break;
    }
  } else if (organization.currentPlanId) {
    const plan = await prisma.plan.findUnique({
      where: { id: organization.currentPlanId },
    });

    if (plan) {
      switch (resourceType) {
        case 'USERS':
          limit = plan.maxUsers;
          break;
        case 'EXAMS':
          limit = plan.maxExams;
          break;
        case 'STUDENTS':
          limit = plan.maxStudents;
          break;
        case 'STORAGE':
          limit = plan.maxStorage ?? Infinity;
          break;
      }
    }
  } else {
    // Fallback to organization's cached limits
    switch (resourceType) {
      case 'USERS':
        limit = organization.maxUsers;
        break;
      case 'EXAMS':
        limit = organization.maxExams;
        break;
      case 'STUDENTS':
        limit = organization.maxStudents;
        break;
      case 'STORAGE':
        limit = Infinity;
        break;
    }
  }

  // Count current usage
  let current = 0;
  switch (resourceType) {
    case 'USERS':
      current = await prisma.membership.count({
        where: {
          organizationId,
          isActive: true,
          deletedAt: null,
        },
      });
      break;
    case 'EXAMS':
      current = await prisma.exam.count({
        where: {
          organizationId,
          deletedAt: null,
        },
      });
      break;
    case 'STUDENTS':
      // Count active student memberships
      const studentRole = await prisma.role.findUnique({
        where: { code: 'SYSTEM_ROLE_STUDENT' },
      });
      if (studentRole) {
        current = await prisma.membership.count({
          where: {
            organizationId,
            roleId: studentRole.id,
            isActive: true,
            deletedAt: null,
          },
        });
      }
      break;
    case 'STORAGE':
      // Storage calculation would need to be implemented based on file sizes
      current = 0;
      break;
  }

  const allowed = limit === null || limit === Infinity || current < limit;

  return {
    allowed,
    current,
    limit,
    reason: allowed
      ? undefined
      : `Plan limit exceeded: ${current}/${limit} ${resourceType}`,
    planLimitExceeded: !allowed,
  };
}

/**
 * Combined authorization check: Permission + Plan Limit
 * 
 * @param userId - User ID
 * @param organizationId - Organization ID
 * @param permissionCode - Permission code
 * @param resourceType - Resource type for plan limit check (optional)
 * @returns Combined authorization result
 */
export async function authorize(
  userId: string,
  organizationId: string | null,
  permissionCode: string,
  resourceType?: 'USERS' | 'EXAMS' | 'STUDENTS' | 'STORAGE'
): Promise<PermissionCheckResult> {
  // Check permission first
  const permissionCheck = await canAccess(userId, organizationId, permissionCode);

  if (!permissionCheck.allowed || !permissionCheck.hasPermission) {
    return permissionCheck;
  }

  // If resource type is specified, check plan limit
  if (resourceType && organizationId) {
    const limitCheck = await checkPlanLimit(organizationId, resourceType);

    if (!limitCheck.allowed) {
      return {
        allowed: false,
        hasPermission: true,
        planAllows: false,
        planLimitExceeded: true,
        reason: limitCheck.reason,
      };
    }

    return {
      allowed: true,
      hasPermission: true,
      planAllows: true,
    };
  }

  return permissionCheck;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get active organization for user (from session or personal organization)
 * 
 * @param userId - User ID
 * @returns Active organization ID or null
 */
export async function getActiveOrganizationId(userId: string): Promise<string | null> {
  try {
    // First, try to get personal organization (simpler query, doesn't require memberships table)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        personalOrganizationId: true,
      },
    });

    // If personal organization exists, return it
    if (user?.personalOrganizationId) {
      return user.personalOrganizationId;
    }

    // Try to get from memberships (only works after migration)
    // This might fail if migration hasn't been run yet, so we catch the error
    try {
      const userWithMemberships = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          memberships: {
            where: {
              isActive: true,
              deletedAt: null,
            },
            select: {
              organizationId: true,
            },
            orderBy: {
              joinedAt: 'desc',
            },
            take: 1,
          },
        },
      });

      return userWithMemberships?.memberships[0]?.organizationId || null;
    } catch (error) {
      // Migration not done yet - this is OK, return null
      console.warn('Memberships table not available (migration may not be done yet):', error);
      return null;
    }
  } catch (error) {
    // General error - log and return null
    console.error('Error getting active organization:', error);
    return null;
  }
}

/**
 * Check if user is super admin (system-wide)
 * 
 * @param userId - User ID
 * @returns True if user is super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, null, 'SYSTEM_ROLE_SUPER_ADMIN');
}
