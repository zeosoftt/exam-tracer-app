/**
 * GET /api/billing/plan
 * Giriş yapmış kullanıcının aktif organizasyonunun plan bilgisini döner.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getActiveOrganizationId } from '@/lib/auth/authorization';
import { getOrganizationPlanInfo } from '@/lib/auth/planLimits';
import { UnauthorizedError } from '@/lib/errors/AppError';
import { HTTP_STATUS } from '@/config/constants';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new UnauthorizedError('Giriş yapmanız gerekiyor');
    }

    const organizationId = await getActiveOrganizationId(session.user.id);
    if (!organizationId) {
      return NextResponse.json(
        { success: true, data: null, message: 'Organizasyon yok' },
        { status: HTTP_STATUS.OK }
      );
    }

    const planInfo = await getOrganizationPlanInfo(organizationId);
    if (!planInfo) {
      return NextResponse.json(
        { success: true, data: null },
        { status: HTTP_STATUS.OK }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        planCode: planInfo.planCode,
        planName: planInfo.planName,
        planType: planInfo.planType,
        subscriptionStatus: planInfo.subscriptionStatus,
        limits: planInfo.limits,
        features: planInfo.features,
        expiresAt: planInfo.expiresAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: HTTP_STATUS.UNAUTHORIZED });
    }
    return NextResponse.json(
      { error: 'Plan bilgisi alınamadı' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
