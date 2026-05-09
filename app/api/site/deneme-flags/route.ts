/**
 * Public read-only: deneme sayfası özellik bayrakları (auth gerekmez).
 */

import { NextResponse } from 'next/server';
import { getSettingBoolean, SITE_KEYS } from '@/lib/siteSettings';
import { HTTP_STATUS } from '@/config/constants';

export async function GET() {
  try {
    const deneme_show_advanced = await getSettingBoolean(SITE_KEYS.DENEME_SHOW_ADVANCED);
    return NextResponse.json({
      success: true,
      data: { deneme_show_advanced },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to load flags' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
