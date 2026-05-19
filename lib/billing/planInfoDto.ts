import type { OrganizationPlanInfo } from '@/lib/auth/planLimits';

/** Plan API / settings bundle için ortak DTO (DRY). */
export type PlanInfoDto = {
  planCode: string;
  planName: string;
  planType: string;
  subscriptionStatus: string;
  limits: Array<{ resourceType: string; current: number; limit: number; allowed: boolean }>;
  features: string[];
  expiresAt: string | null;
};

export function toPlanInfoDto(plan: OrganizationPlanInfo): PlanInfoDto {
  return {
    planCode: plan.planCode,
    planName: plan.planName,
    planType: plan.planType,
    subscriptionStatus: plan.subscriptionStatus,
    limits: plan.limits.map((l) => ({
      resourceType: l.resourceType,
      current: l.current,
      limit: l.limit,
      allowed: l.allowed,
    })),
    features: plan.features,
    expiresAt: plan.expiresAt?.toISOString() ?? null,
  };
}
