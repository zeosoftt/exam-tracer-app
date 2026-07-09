/**
 * E-posta değiştirme kodu gönderimi.
 */

import { Resend } from 'resend';
import { logInfo, logError } from '@/lib/logger';

export type SendEmailChangeParams = {
  to: string;
  firstName: string;
  verificationCode: string;
  codeValidityHours?: number;
};

const DEFAULT_FROM = 'The Goal Lab <onboarding@resend.dev>';

export async function sendEmailChangeVerification(params: SendEmailChangeParams): Promise<void> {
  const { to, firstName, verificationCode, codeValidityHours = 24 } = params;
  const apiKey = process.env.RESEND_API_KEY;
  const html = `
    <p>Merhaba ${firstName},</p>
    <p>E-posta adresinizi değiştirmek için doğrulama kodunuz:</p>
    <p style="font-size:28px;font-weight:bold;letter-spacing:0.3em">${verificationCode}</p>
    <p>Kod ${codeValidityHours} saat geçerlidir.</p>
  `.trim();

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const from = process.env.EMAIL_FROM || DEFAULT_FROM;
      const { error } = await resend.emails.send({
        from,
        to: [to],
        subject: 'E-posta değişikliği doğrulama kodu - The Goal Lab',
        html,
      });
      if (error) {
        logError('Email change send failed', new Error(JSON.stringify(error)), { to });
        logInfo('Email change code (fallback)', { to, verificationCode });
      }
      return;
    } catch (err) {
      logError('Email change send exception', err as Error, { to });
    }
  }

  logInfo('Email change code (RESEND not set)', { to, verificationCode });
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`\n[DEV] E-posta değişikliği kodu → ${to}: ${verificationCode}\n`);
  }
}
