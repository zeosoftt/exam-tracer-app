/**
 * GET /api/billing/plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationPlanInfo } from '@/lib/auth/planLimits';
import { getActiveOrganizationId } from '@/lib/auth/authorization';
import { toPlanInfoDto } from '@/lib/billing/planInfoDto';
import { authSuccess } from '@/lib/auth/responses';
import { withSessionHandler } from '@/lib/api/withSessionHandler';

async function getBillingPlanHandler(_req: NextRequest, { userId }: { userId: string }): Promise<NextResponse> {
  const organizationId = await getActiveOrganizationId(userId);
  if (!organizationId) {
    return authSuccess(null);
  }

  const planInfo = await getOrganizationPlanInfo(organizationId);
  if (!planInfo) {
    return authSuccess(null);
  }

  return authSuccess(toPlanInfoDto(planInfo));
}

export const GET = withSessionHandler(getBillingPlanHandler);
