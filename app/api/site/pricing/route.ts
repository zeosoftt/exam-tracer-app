/**
 * Public read-only: Pro plan fiyatlandırma (auth gerekmez).
 */

import { NextResponse } from 'next/server';
import { getPublicPricingConfig } from '@/lib/siteSettings';
import { HTTP_STATUS } from '@/config/constants';

export async function GET() {
  try {
    const data = await getPublicPricingConfig();
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to load pricing' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
