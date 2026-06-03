/**
 * GET /api/auth/dev-verification-code?email=...
 * Yalnızca development — local test için son doğrulama kodunu döner.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const email = new URL(req.url).searchParams.get('email')?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  });

  if (!user || user.emailVerified) {
    return NextResponse.json({ code: null });
  }

  const token = await prisma.emailVerificationToken.findFirst({
    where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    select: { token: true },
  });

  return NextResponse.json({ code: token?.token ?? null });
}
