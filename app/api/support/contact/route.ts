/**
 * POST /api/support/contact
 * Genel destek formu (giriş gerekmez). IP bazlı rate limit.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { supportContactSchema } from '@/lib/validation/schemas';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { HTTP_STATUS, RATE_LIMIT } from '@/config/constants';
import { sendSupportContactEmail } from '@/lib/email/sendSupportContactEmail';
import { SUPPORT_CATEGORY_LABELS } from '@/lib/support/supportContactCategories';

const limiter = rateLimit(RATE_LIMIT.LOGIN_MAX_REQUESTS, RATE_LIMIT.LOGIN_WINDOW_MS);

export async function POST(req: NextRequest) {
  const limited = limiter(req);
  if (limited) return limited;

  try {
    const json = await req.json();
    const parsed = supportContactSchema.safeParse(json);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg =
        first.email?.[0] ||
        first.subject?.[0] ||
        first.message?.[0] ||
        first.category?.[0] ||
        'Geçersiz form verisi.';
      return NextResponse.json({ success: false, error: msg }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email?.toLowerCase().trim() ?? null;
    const fromEmail = sessionEmail ?? parsed.data.email.toLowerCase().trim();

    if (sessionEmail && parsed.data.email.toLowerCase().trim() !== sessionEmail) {
      return NextResponse.json(
        { success: false, error: 'Oturum e-postanız ile formdaki e-posta eşleşmiyor.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const categoryLabel = SUPPORT_CATEGORY_LABELS[parsed.data.category] ?? parsed.data.category;
    const mailResult = await sendSupportContactEmail({
      fromEmail,
      userName: session?.user?.name ?? null,
      userId: session?.user?.id ?? null,
      category: parsed.data.category,
      categoryLabel,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });

    if (!mailResult.ok) {
      const status =
        mailResult.reason === 'not_configured'
          ? HTTP_STATUS.SERVICE_UNAVAILABLE
          : mailResult.reason === 'provider_error'
            ? HTTP_STATUS.BAD_GATEWAY
            : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      return NextResponse.json({ success: false, error: mailResult.userMessage }, { status });
    }

    return NextResponse.json({
      success: true,
      message:
        'Mesajınız bize ulaştı. Mümkün olan en kısa sürede yanıtlamaya çalışıyoruz. Gelen kutunuzu ve spam klasörünü kontrol etmeyi unutmayın.',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
