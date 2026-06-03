/**
 * E-posta doğrulama kodu gönderimi
 * RESEND_API_KEY varsa Resend ile gerçek e-posta gönderilir; yoksa kod loglanır.
 */

import { Resend } from 'resend';
import { logInfo, logError } from '@/lib/logger';

export type SendVerificationEmailParams = {
  to: string;
  firstName: string;
  verificationCode: string;
  /** DB ile aynı süre; e-posta metninde gösterilir (varsayılan 24) */
  codeValidityHours?: number;
};

/** Resend için gönderici adresi. Kendi domain'inizi doğruladıysanız EMAIL_FROM ile değiştirin. */
const DEFAULT_FROM = 'The Goal Lab <onboarding@resend.dev>';

function getVerificationEmailHtml(firstName: string, code: string, validityHours: number): string {
  const ttlLabel =
    validityHours % 24 === 0
      ? `${validityHours / 24} gün`
      : `${validityHours} saat`;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>E-posta doğrulama</title></head>
<body style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h2>Merhaba ${firstName}</h2>
  <p>Hesabınızı oluşturdunuz. E-posta adresinizi doğrulamak için aşağıdaki 6 haneli kodu uygulamaya girin:</p>
  <p style="font-size: 32px; font-weight: bold; letter-spacing: 0.35em; text-align: center; margin: 28px 0; color: #0d9488;">${code}</p>
  <p>Kod ${ttlLabel} geçerlidir. Doğrulama sayfası: hesabınızla giriş yapmadan önce kayıt sonrası yönlendirildiğiniz ekranda bu kodu girebilirsiniz.</p>
  <p>Bu işlemi siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="color: #666; font-size: 12px;">The Goal Lab</p>
</body>
</html>
`.trim();
}

/**
 * Doğrulama e-postası gönderir. RESEND_API_KEY varsa Resend ile gönderir, yoksa kodu loglar.
 */
export async function sendVerificationEmail(params: SendVerificationEmailParams): Promise<void> {
  const { to, firstName, verificationCode, codeValidityHours = 24 } = params;
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const from = process.env.EMAIL_FROM || DEFAULT_FROM;
      const { data, error } = await resend.emails.send({
        from,
        to: [to],
        subject: 'E-posta doğrulama kodunuz - The Goal Lab',
        html: getVerificationEmailHtml(firstName, verificationCode, codeValidityHours),
      });
      if (error) {
        logError('Resend verification email failed', new Error(JSON.stringify(error)), { to, error });
        logInfo('Verification code (fallback)', { to, verificationCode });
        logDevVerificationCode(to, verificationCode);
      } else {
        logInfo('Verification email sent', { to, id: data?.id });
      }
      return;
    } catch (err) {
      logError('Resend send exception', err as Error, { to });
      logInfo('Verification code (fallback)', { to, verificationCode });
      logDevVerificationCode(to, verificationCode);
      return;
    }
  }

  logInfo('Email verification code (RESEND_API_KEY not set)', { to, verificationCode });
  logDevVerificationCode(to, verificationCode);
}

function logDevVerificationCode(to: string, verificationCode: string): void {
  if (process.env.NODE_ENV !== 'development') return;
  // eslint-disable-next-line no-console -- local geliştirmede kodu terminalde görünür kıl
  console.log('\n========== DEV: E-POSTA DOĞRULAMA KODU ==========');
  console.log(`Alıcı: ${to}`);
  console.log(`Kod:   ${verificationCode}`);
  console.log('Doğrulama: /auth/verify-email');
  console.log('==================================================\n');
}
