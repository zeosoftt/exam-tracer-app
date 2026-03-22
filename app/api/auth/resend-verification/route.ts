/**
 * POST /api/auth/resend-verification
 * Doğrulanmamış hesap için yeni doğrulama e-postası (IP bazlı rate limit)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { issueVerificationEmailForUser } from '@/lib/auth/issueVerificationEmail';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { HTTP_STATUS, RATE_LIMIT } from '@/config/constants';

const bodySchema = z.object({
  email: z.string().email().max(255),
});

const limiter = rateLimit(5, RATE_LIMIT.LOGIN_WINDOW_MS);

export async function POST(req: NextRequest) {
  const limited = limiter(req);
  if (limited) return limited;

  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: true, message: 'İşlem tamamlandı.' },
        { status: HTTP_STATUS.OK }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, deletedAt: true, isActive: true, emailVerified: true },
    });

    if (user && user.deletedAt === null && user.isActive && !user.emailVerified) {
      await issueVerificationEmailForUser(user.id);
    }

    return NextResponse.json({
      success: true,
      message:
        'Eğer bu e-posta kayıtlı ve henüz doğrulanmamışsa, doğrulama bağlantısı gönderildi. Gelen kutunuzu ve spam klasörünü kontrol edin.',
    });
  } catch {
    return NextResponse.json({
      success: true,
      message: 'İşlem tamamlandı.',
    });
  }
}
