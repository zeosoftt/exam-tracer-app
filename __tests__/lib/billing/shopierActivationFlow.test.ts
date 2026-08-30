/**
 * First activation path: adapter PurchaseEvent → activatePlanByEmail (mocked).
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
import { activatePlanByEmail } from '@/lib/billing/activateOrganizationPlan';
import { mapShopierOrderCreatedToPurchaseEvent } from '@/lib/billing/shopier';
import { SHOPIER_ORDER_CREATED_EVENT } from '@/lib/billing/shopier/mapShopierOrderCreated';

const mockPrisma = prisma as unknown as {
  plan: { findFirst: jest.Mock };
  user: { findFirst: jest.Mock };
  subscription: { findFirst: jest.Mock };
  organization: { update: jest.Mock };
  $transaction: jest.Mock;
};

describe('Shopier PurchaseEvent → activation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.plan.findFirst.mockResolvedValue({
      id: 'plan-pro',
      price: 99,
      currency: 'TRY',
    });
    mockPrisma.user.findFirst.mockResolvedValue({
      id: 'user-1',
      personalOrganizationId: 'org-1',
    });
  });

  it('first valid purchase activates via existing service', async () => {
    mockPrisma.subscription.findFirst.mockResolvedValue(null);
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        organization: { update: jest.fn().mockResolvedValue({}) },
        subscription: { create: jest.fn().mockResolvedValue({ id: 'sub-1' }) },
      };
      await fn(tx);
      return undefined;
    });

    const mapped = mapShopierOrderCreatedToPurchaseEvent(
      SHOPIER_ORDER_CREATED_EVENT,
      {
        id: 'ord-first',
        paymentStatus: 'paid',
        shippingInfo: { email: 'buyer@example.com' },
        lineItems: [{ productId: '47039117' }],
      },
      ['47039117'],
    );
    expect(mapped.ok).toBe(true);
    if (!mapped.ok) return;

    const result = await activatePlanByEmail(
      mapped.purchase.email,
      mapped.purchase.planCode,
      mapped.purchase.orderId,
    );
    expect(result.idempotent).toBe(false);
    expect(result.userId).toBe('user-1');
  });

  it('duplicate order returns idempotent without second subscription', async () => {
    mockPrisma.subscription.findFirst.mockResolvedValue({
      id: 'sub-existing',
      organizationId: 'org-1',
    });
    mockPrisma.organization.update.mockResolvedValue({});

    const mapped = mapShopierOrderCreatedToPurchaseEvent(
      SHOPIER_ORDER_CREATED_EVENT,
      {
        id: 'ord-dup',
        paymentStatus: 'paid',
        shippingInfo: { email: 'buyer@example.com' },
        lineItems: [{ productId: '47039117' }],
      },
      ['47039117'],
    );
    expect(mapped.ok).toBe(true);
    if (!mapped.ok) return;

    const first = await activatePlanByEmail(
      mapped.purchase.email,
      mapped.purchase.planCode,
      mapped.purchase.orderId,
    );
    expect(first.idempotent).toBe(true);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});
