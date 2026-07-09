/**
 * Plan Limit Guard Service
 * 
 * Handles subscription plan-based feature access and resource limits
 * Works together with authorization service for complete access control
 */

import { prisma } from '@/lib/db/prisma';
import { checkPlanLimit, checkPlanLimitsBatch, canUseFeature } from './authorization';

// ============================================================================
// TYPES
// ============================================================================

export interface PlanLimitInfo {
  resourceType: 'USERS' | 'EXAMS' | 'STUDENTS' | 'STORAGE';
  current: number;
  limit: number;
  allowed: boolean;
  percentage: number;
}

export interface OrganizationPlanInfo {
  planId: string;
  planCode: string;
  planName: string;
  planType: 'FREE' | 'PRO' | 'ENTERPRISE';
  subscriptionStatus: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL' | 'SUSPENDED';
  limits: PlanLimitInfo[];
  features: string[];
  expiresAt?: Date;
}

// ============================================================================
// PLAN LIMIT CHECKS
// ============================================================================

/**
 * Check if organization can perform action based on plan limits
 * 
 * @param organizationId - Organization ID
 * @param action - Action type (CREATE_USER, CREATE_EXAM, etc.)
 * @returns True if action is allowed
 */
export async function canPerformAction(
  organizationId: string,
  action: 'CREATE_USER' | 'CREATE_EXAM' | 'CREATE_STUDENT' | 'USE_STORAGE'
): Promise<{ allowed: boolean; reason?: string }> {
  const resourceMap: Record<string, 'USERS' | 'EXAMS' | 'STUDENTS' | 'STORAGE'> = {
    CREATE_USER: 'USERS',
    CREATE_EXAM: 'EXAMS',
    CREATE_STUDENT: 'STUDENTS',
    USE_STORAGE: 'STORAGE',
  };

  const resourceType = resourceMap[action];
  if (!resourceType) {
    return { allowed: false, reason: 'Invalid action' };
  }

  const limitCheck = await checkPlanLimit(organizationId, resourceType);

  return {
    allowed: limitCheck.allowed,
    reason: limitCheck.reason,
  };
}

/**
 * Get organization's plan information
 * 
 * @param organizationId - Organization ID
 * @returns Plan information with limits and features
 */
export async function getOrganizationPlanInfo(
  organizationId: string
): Promise<OrganizationPlanInfo | null> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      subscriptions: {
        where: {
          deletedAt: null,
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
    return null;
  }

  // Get active subscription or fallback to current plan
  const activeSubscription = organization.subscriptions.find(
    (s) =>
      s.status === 'ACTIVE' &&
      !s.deletedAt &&
      s.currentPeriodEnd >= new Date()
  );

  let plan = activeSubscription?.plan;
  let subscriptionStatus: OrganizationPlanInfo['subscriptionStatus'] = 'ACTIVE';

  if (!plan && organization.currentPlanId) {
    const currentPlan = await prisma.plan.findUnique({
      where: { id: organization.currentPlanId },
      include: {
        planFeatures: {
          include: {
            feature: true,
          },
        },
      },
    });
    plan = currentPlan ?? undefined;
    subscriptionStatus = 'TRIAL';
  }

  if (!plan) {
    // Default to FREE plan
    const freePlan = await prisma.plan.findUnique({
      where: { code: 'FREE' },
      include: {
        planFeatures: {
          include: {
            feature: true,
          },
        },
      },
    });

    if (!freePlan) {
      return null;
    }
    plan = freePlan;
    subscriptionStatus = 'TRIAL';
  }

  // Get limits (single org fetch + parallel counts)
  const batch = await checkPlanLimitsBatch(organizationId, ['USERS', 'EXAMS', 'STUDENTS']);
  const limits: PlanLimitInfo[] = (['USERS', 'EXAMS', 'STUDENTS'] as const).map((resourceType) => {
    const check = batch[resourceType];
    return {
      resourceType,
      current: check.current,
      limit: check.limit,
      allowed: check.allowed,
      percentage: check.limit > 0 ? Math.round((check.current / check.limit) * 100) : 0,
    };
  });

  // Get features
  const features = plan.planFeatures
    .filter((pf) => !pf.feature.deletedAt)
    .map((pf) => pf.feature.code);

  return {
    planId: plan.id,
    planCode: plan.code,
    planName: plan.name,
    planType: plan.type,
    subscriptionStatus,
    limits,
    features,
    expiresAt: activeSubscription?.currentPeriodEnd,
  };
}

/**
 * Check if organization has active subscription
 * 
 * @param organizationId - Organization ID
 * @returns True if organization has active subscription
 */
export async function hasActiveSubscription(organizationId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      organizationId,
      status: 'ACTIVE',
      deletedAt: null,
      currentPeriodEnd: {
        gte: new Date(),
      },
    },
  });

  return !!subscription;
}

/**
 * Check if organization can access premium feature
 * 
 * @param organizationId - Organization ID
 * @param featureCode - Feature code
 * @returns True if feature is available
 */
export async function hasFeatureAccess(
  organizationId: string,
  featureCode: string
): Promise<boolean> {
  return canUseFeature(organizationId, featureCode);
}

/**
 * Get organization's usage statistics
 * 
 * @param organizationId - Organization ID
 * @returns Usage statistics
 */
export async function getUsageStatistics(organizationId: string) {
  const [usersCount, examsCount, studentsCount] = await Promise.all([
    prisma.membership.count({
      where: {
        organizationId,
        isActive: true,
        deletedAt: null,
      },
    }),
    prisma.exam.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    }),
    (async () => {
      const studentRole = await prisma.role.findUnique({
        where: { code: 'SYSTEM_ROLE_STUDENT' },
      });
      if (!studentRole) return 0;
      return prisma.membership.count({
        where: {
          organizationId,
          roleId: studentRole.id,
          isActive: true,
          deletedAt: null,
        },
      });
    })(),
  ]);

  return {
    users: usersCount,
    exams: examsCount,
    students: studentsCount,
  };
}
