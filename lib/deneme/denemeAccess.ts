/**
 * Deneme takibi erişim: site bayrağı + Premium (ADVANCED_ANALYTICS) yalnızca detay/analiz
 */

import { NextResponse } from 'next/server';
import { getActiveOrganizationId } from '@/lib/auth/authorization';
import { hasFeatureAccess } from '@/lib/auth/planLimits';
import { HTTP_STATUS } from '@/config/constants';
import { isDenemeAdvancedEnabled } from '@/lib/siteSettings';

export const DENEME_PREMIUM_ERROR =
  'Deneme takibi, ÖSYM puan hesaplama ve analiz Premium plan özelliğidir.';

export const DENEME_DETAIL_PREMIUM_ERROR =
  'Deneme detayı, ders/konu analizi ve bilgi karşılaştırması Premium plan özelliğidir.';

export async function userCanAccessDenemeDetail(userId: string): Promise<boolean> {
  const siteEnabled = await isDenemeAdvancedEnabled();
  if (!siteEnabled) return false;

  const organizationId = await getActiveOrganizationId(userId);
  if (!organizationId) return false;

  return hasFeatureAccess(organizationId, 'ADVANCED_ANALYTICS');
}

/** @deprecated userCanAccessDenemeDetail kullanın */
export async function userCanAccessDenemeAdvanced(userId: string): Promise<boolean> {
  return userCanAccessDenemeDetail(userId);
}

/** Site kapalıysa 403; liste/kayıt için premium gerekmez */
export async function denemeSiteDisabledResponse(): Promise<NextResponse | null> {
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

  return null;
}

/** Detay ve analiz — Premium gerekir */
export async function denemeDetailAccessDeniedResponse(
  userId: string,
): Promise<NextResponse | null> {
  const siteDisabled = await denemeSiteDisabledResponse();
  if (siteDisabled) return siteDisabled;

  const canAccess = await userCanAccessDenemeDetail(userId);
  if (!canAccess) {
    return NextResponse.json(
      {
        success: false,
        error: DENEME_DETAIL_PREMIUM_ERROR,
        code: 'PREMIUM_REQUIRED',
      },
      { status: HTTP_STATUS.FORBIDDEN },
    );
  }

  return null;
}

/** Premium veya site kapalıysa 403; aksi halde null — geriye dönük uyumluluk */
export async function denemeAccessDeniedResponse(
  userId: string,
): Promise<NextResponse | null> {
  return denemeDetailAccessDeniedResponse(userId);
}
