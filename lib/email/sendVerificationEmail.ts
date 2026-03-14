/**
 * E-posta doğrulama linki gönderimi
 * RESEND_API_KEY varsa Resend ile gerçek e-posta gönderilir; yoksa link loglanır.
 */

import { Resend } from 'resend';
import { logInfo, logError } from '@/lib/logger';

export type SendVerificationEmailParams = {
  to: string;
  firstName: string;
  verifyUrl: string;
};

/** Resend için gönderici adresi. Kendi domain'inizi doğruladıysanız EMAIL_FROM ile değiştirin. */
const DEFAULT_FROM = 'The Goal Lab <onboarding@resend.dev>';

function getVerificationEmailHtml(firstName: string, verifyUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>E-posta doğrulama</title></head>
<body style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h2>Merhaba ${firstName}</h2>
  <p>Hesabınızı oluşturdunuz. E-posta adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
  <p><a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #0d9488; color: white; text-decoration: none; border-radius: 8px;">E-postamı doğrula</a></p>
  <p>Bağlantı 24 saat geçerlidir.</p>
  <p>Bu işlemi siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="color: #666; font-size: 12px;">The Goal Lab</p>
</body>
</html>
`.trim();
}

/**
 * Doğrulama e-postası gönderir. RESEND_API_KEY varsa Resend ile gönderir, yoksa linki loglar.
 */
export async function sendVerificationEmail(params: SendVerificationEmailParams): Promise<void> {
  const { to, firstName, verifyUrl } = params;
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const from = process.env.EMAIL_FROM || DEFAULT_FROM;
      const { data, error } = await resend.emails.send({
        from,
        to: [to],
        subject: 'E-posta adresinizi doğrulayın - The Goal Lab',
        html: getVerificationEmailHtml(firstName, verifyUrl),
      });
      if (error) {
        logError('Resend verification email failed', new Error(JSON.stringify(error)), { to, error });
        logInfo('Verification link (fallback)', { to, verifyUrl });
      } else {
        logInfo('Verification email sent', { to, id: data?.id });
      }
      return;
    } catch (err) {
      logError('Resend send exception', err as Error, { to });
      logInfo('Verification link (fallback)', { to, verifyUrl });
      return;
    }
  }

  logInfo('Email verification link (RESEND_API_KEY not set)', { to, verifyUrl });
}

/**
 * Doğrulama URL'ini oluşturur (base URL + /auth/verify-email?token=...)
 */
export function buildVerificationUrl(token: string): string {
  const base = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  return `${base}/auth/verify-email?token=${encodeURIComponent(token)}`;
}
