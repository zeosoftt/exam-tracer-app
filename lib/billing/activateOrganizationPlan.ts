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

export async function activateOrganizationPlan(params: ActivatePlanParams): Promise<{ idempotent: boolean }> {
  const plan = await prisma.plan.findFirst({
    where: { code: params.planCode.toUpperCase(), isActive: true },
    select: { id: true, price: true, currency: true },
  });
  if (!plan) {
    throw new Error(`Plan not found: ${params.planCode}`);
  }

  if (params.externalOrderId) {
    const existing = await prisma.subscription.findFirst({
      where: {
        deletedAt: null,
        metadata: {
          path: ['externalOrderId'],
          equals: params.externalOrderId,
        },
      },
      select: { id: true, organizationId: true },
    });
    if (existing) {
      await prisma.organization.update({
        where: { id: existing.organizationId },
        data: { currentPlanId: plan.id, subscriptionId: existing.id },
      });
      return { idempotent: true };
    }
  }

  const periodDays = params.periodDays ?? 30;
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + periodDays);

  await prisma.$transaction(async (tx) => {
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

  return { idempotent: false };
}

/** E-posta ile kullanıcı bulup planı PRO (veya verilen kod) yapar. */
export async function activatePlanByEmail(
  email: string,
  planCode: string,
  externalOrderId?: string,
): Promise<{ userId: string; organizationId: string; idempotent: boolean }> {
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase().trim(), deletedAt: null, isActive: true },
    select: { id: true, personalOrganizationId: true },
  });
  if (!user?.personalOrganizationId) {
    throw new Error('User or personal organization not found');
  }

  const activation = await activateOrganizationPlan({
    userId: user.id,
    organizationId: user.personalOrganizationId,
    planCode,
    externalOrderId,
    subscriptionStatus: 'ACTIVE',
  });

  return {
    userId: user.id,
    organizationId: user.personalOrganizationId,
    idempotent: activation.idempotent,
  };
}
