/**
 * GET /api/billing/plan
 */

import { NextResponse } from 'next/server';
import { getActiveOrganizationId } from '@/lib/auth/authorization';
import { getOrganizationPlanInfo } from '@/lib/auth/planLimits';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { toPlanInfoDto } from '@/lib/billing/planInfoDto';
import { UnauthorizedError } from '@/lib/errors/AppError';
import { HTTP_STATUS } from '@/config/constants';

export async function GET() {
  try {
    const session = await requireSession();
    const organizationId = await getActiveOrganizationId(getSessionUserId(session));

    if (!organizationId) {
      return NextResponse.json(
        { success: true, data: null, message: 'Organizasyon yok' },
        { status: HTTP_STATUS.OK },
      );
    }

    const planInfo = await getOrganizationPlanInfo(organizationId);
    if (!planInfo) {
      return NextResponse.json({ success: true, data: null }, { status: HTTP_STATUS.OK });
    }

    return NextResponse.json({ success: true, data: toPlanInfoDto(planInfo) });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: HTTP_STATUS.UNAUTHORIZED });
    }
    return NextResponse.json(
      { error: 'Plan bilgisi alınamadı' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
