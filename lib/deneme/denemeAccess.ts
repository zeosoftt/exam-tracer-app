/**
 * Deneme takibi erişim: site bayrağı + Premium (ADVANCED_ANALYTICS)
 */

import { NextResponse } from 'next/server';
import { getActiveOrganizationId } from '@/lib/auth/authorization';
import { hasFeatureAccess } from '@/lib/auth/planLimits';
import { HTTP_STATUS } from '@/config/constants';
import { isDenemeAdvancedEnabled } from '@/lib/siteSettings';

export const DENEME_PREMIUM_ERROR =
  'Deneme takibi, ÖSYM puan hesaplama ve analiz Premium plan özelliğidir.';

export async function userCanAccessDenemeAdvanced(userId: string): Promise<boolean> {
  const siteEnabled = await isDenemeAdvancedEnabled();
  if (!siteEnabled) return false;

  const organizationId = await getActiveOrganizationId(userId);
  if (!organizationId) return false;

  return hasFeatureAccess(organizationId, 'ADVANCED_ANALYTICS');
}

/** Premium veya site kapalıysa 403; aksi halde null */
export async function denemeAccessDeniedResponse(
  userId: string,
): Promise<NextResponse | null> {
  const siteEnabled = await isDenemeAdvancedEnabled();
  if (!siteEnabled) {
    return NextResponse.json(
      {
        success: false,
        error: 'Gelişmiş deneme özellikleri şu an kapalı.',
        code: 'FEATURE_DISABLED',
      },
      { status: HTTP_STATUS.FORBIDDEN },
    );
  }

  const organizationId = await getActiveOrganizationId(userId);
  const canAccess = organizationId
    ? await hasFeatureAccess(organizationId, 'ADVANCED_ANALYTICS')
    : false;

  if (!canAccess) {
    return NextResponse.json(
      {
        success: false,
        error: DENEME_PREMIUM_ERROR,
        code: 'PREMIUM_REQUIRED',
      },
      { status: HTTP_STATUS.FORBIDDEN },
    );
  }

  return null;
}
