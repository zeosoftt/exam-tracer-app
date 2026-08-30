/**
 * activateOrganizationPlan / activatePlanByEmail — mocked Prisma.
 */

jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    plan: { findFirst: jest.fn() },
    user: { findFirst: jest.fn() },
    subscription: { findFirst: jest.fn() },
    organization: { update: jest.fn() },
    $transaction: jest.fn(),
  },
}));

import { prisma } from '@/lib/db/prisma';
import {
  activateOrganizationPlan,
  activatePlanByEmail,
} from '@/lib/billing/activateOrganizationPlan';
import { AppError } from '@/lib/errors/AppError';
import { PRO_PLAN_PERIOD_DAYS } from '@/config/constants';

const mockPrisma = prisma as unknown as {
  plan: { findFirst: jest.Mock };
  user: { findFirst: jest.Mock };
  subscription: { findFirst: jest.Mock };
  organization: { update: jest.Mock };
  $transaction: jest.Mock;
};

describe('activatePlanByEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws USER_NOT_FOUND for unknown email', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    await expect(activatePlanByEmail('missing@example.com', 'PRO', 'ord_x')).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
    });
  });

  it('throws ORGANIZATION_NOT_FOUND when personalOrganizationId is null', async () => {
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      personalOrganizationId: null,
    });
    await expect(activatePlanByEmail('legacy@example.com', 'PRO', 'ord_x')).rejects.toMatchObject({
      code: 'ORGANIZATION_NOT_FOUND',
    });
  });

  it('normalizes email before lookup', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    await expect(activatePlanByEmail('  A@B.COM ', 'PRO')).rejects.toBeInstanceOf(AppError);
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ email: 'a@b.com' }),
      }),
    );
  });
});

describe('activateOrganizationPlan idempotency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.plan.findFirst.mockResolvedValue({
      id: 'plan-pro',
      price: 99,
      currency: 'TRY',
    });
  });

  it('returns idempotent true for existing externalOrderId without creating subscription', async () => {
    mockPrisma.subscription.findFirst.mockResolvedValue({
      id: 'sub-1',
      organizationId: 'org-1',
    });
    mockPrisma.organization.update.mockResolvedValue({});

    const result = await activateOrganizationPlan({
      userId: 'user-1',
      organizationId: 'org-1',
      planCode: 'PRO',
      externalOrderId: 'ord_dup',
    });

    expect(result.idempotent).toBe(true);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    expect(mockPrisma.organization.update).toHaveBeenCalledWith({
      where: { id: 'org-1' },
      data: { currentPlanId: 'plan-pro', subscriptionId: 'sub-1' },
    });
  });

  it('creates subscription with 6-month period on first activation', async () => {
    mockPrisma.subscription.findFirst.mockResolvedValue(null);
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        organization: { update: jest.fn().mockResolvedValue({}) },
        subscription: {
          create: jest.fn().mockResolvedValue({ id: 'sub-new' }),
        },
      };
      await fn(tx);
      expect(tx.subscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metadata: { externalOrderId: 'ord_new', provider: 'shopier' },
          }),
        }),
      );
      const periodEnd: Date = tx.subscription.create.mock.calls[0][0].data.currentPeriodEnd;
      const days =
        Math.round((periodEnd.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      expect(days).toBeGreaterThanOrEqual(PRO_PLAN_PERIOD_DAYS - 1);
      expect(days).toBeLessThanOrEqual(PRO_PLAN_PERIOD_DAYS + 1);
      return undefined;
    });

    const result = await activateOrganizationPlan({
      userId: 'user-1',
      organizationId: 'org-1',
      planCode: 'PRO',
      externalOrderId: 'ord_new',
    });

    expect(result.idempotent).toBe(false);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });
});
