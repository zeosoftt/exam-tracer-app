/**
 * Organizasyon + kullanıcı planını günceller; isteğe bağlı abonelik kaydı oluşturur.
 */

import { prisma } from '@/lib/db/prisma';
import type { SubscriptionStatus } from '@prisma/client';

export type ActivatePlanParams = {
  userId: string;
  organizationId: string;
  planCode: string;
  /** Shopier sipariş kimliği vb. */
  externalOrderId?: string;
  subscriptionStatus?: SubscriptionStatus;
  periodDays?: number;
};

export async function activateOrganizationPlan(params: ActivatePlanParams): Promise<void> {
  const plan = await prisma.plan.findFirst({
    where: { code: params.planCode.toUpperCase(), isActive: true },
    select: { id: true, price: true, currency: true },
  });
  if (!plan) {
    throw new Error(`Plan not found: ${params.planCode}`);
  }

  const periodDays = params.periodDays ?? 30;
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + periodDays);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: params.userId },
      data: { currentPlanId: plan.id },
    });
    await tx.organization.update({
      where: { id: params.organizationId },
      data: { currentPlanId: plan.id },
    });

    const subscription = await tx.subscription.create({
      data: {
        organizationId: params.organizationId,
        planId: plan.id,
        status: params.subscriptionStatus ?? 'ACTIVE',
        currentPeriodEnd: periodEnd,
        price: plan.price ?? 0,
        currency: plan.currency,
        metadata: params.externalOrderId
          ? { externalOrderId: params.externalOrderId, provider: 'shopier' }
          : undefined,
      },
      select: { id: true },
    });

    await tx.organization.update({
      where: { id: params.organizationId },
      data: { subscriptionId: subscription.id },
    });
  });
}

/** E-posta ile kullanıcı bulup planı PRO (veya verilen kod) yapar. */
export async function activatePlanByEmail(
  email: string,
  planCode: string,
  externalOrderId?: string,
): Promise<{ userId: string; organizationId: string }> {
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase().trim(), deletedAt: null, isActive: true },
    select: { id: true, personalOrganizationId: true },
  });
  if (!user?.personalOrganizationId) {
    throw new Error('User or personal organization not found');
  }

  await activateOrganizationPlan({
    userId: user.id,
    organizationId: user.personalOrganizationId,
    planCode,
    externalOrderId,
    subscriptionStatus: 'ACTIVE',
  });

  return { userId: user.id, organizationId: user.personalOrganizationId };
}
