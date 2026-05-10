/**
 * Şifre sıfırlama — Resend ile kullanıcıya reset linki.
 * RESEND_API_KEY yoksa sadece log (çağıran route yine başarı mesajı döner).
 */

import { Resend } from 'resend';
import { logInfo, logError } from '@/lib/logger';

const DEFAULT_FROM = 'The Goal Lab <onboarding@resend.dev>';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildResetEmailHtml(firstName: string, resetUrl: string, ttlMinutes: number): string {
  const ttlLabel = ttlMinutes >= 60 && ttlMinutes % 60 === 0 ? `${ttlMinutes / 60} saat` : `${ttlMinutes} dakika`;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Şifre sıfırlama</title></head>
<body style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h2>Merhaba ${escapeHtml(firstName)}</h2>
  <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın. Bu bağlantı <strong>${ttlLabel}</strong> geçerlidir.</p>
  <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #0d9488; color: white; text-decoration: none; border-radius: 8px;">Şifremi sıfırla</a></p>
  <p>Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; şifreniz değişmez.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="color: #666; font-size: 12px;">The Goal Lab</p>
</body>
</html>
`.trim();
}

export type SendPasswordResetEmailParams = {
  to: string;
  firstName: string;
  resetUrl: string;
  ttlMinutes: number;
};

/** true = Resend kabul etti veya anahtar yok (log ile devam); false = Resend hata döndü */
export async function sendPasswordResetEmail(params: SendPasswordResetEmailParams): Promise<boolean> {
  const { to, firstName, resetUrl, ttlMinutes } = params;
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;

  if (!apiKey) {
    logInfo('Password reset email skipped (RESEND_API_KEY not set)', { to });
    return true;
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject: 'Şifre sıfırlama - The Goal Lab',
      html: buildResetEmailHtml(firstName, resetUrl, ttlMinutes),
    });
    if (error) {
      logError('Resend password reset email failed', new Error(JSON.stringify(error)), { to });
      return false;
    }
    logInfo('Password reset email sent', { to, id: data?.id });
    return true;
  } catch (err) {
    logError('Resend password reset send exception', err as Error, { to });
    return false;
  }
}
