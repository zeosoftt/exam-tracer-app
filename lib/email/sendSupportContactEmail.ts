/**
 * Destek talebi — Resend ile SUPPORT_INBOX_EMAIL adresine iletilir.
 * RESEND_API_KEY veya SUPPORT_INBOX_EMAIL yoksa içerik loglanır (kayıp olmaz).
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

function buildSupportEmailHtml(params: {
  categoryLabel: string;
  subject: string;
  message: string;
  fromEmail: string;
  userName: string | null;
  userId: string | null;
}): string {
  const { categoryLabel, subject, message, fromEmail, userName, userId } = params;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Destek talebi</title></head>
<body style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h2>Yeni destek talebi</h2>
  <p><strong>Kategori:</strong> ${escapeHtml(categoryLabel)}</p>
  <p><strong>Konu:</strong> ${escapeHtml(subject)}</p>
  <p><strong>Gönderen e-posta:</strong> ${escapeHtml(fromEmail)}</p>
  ${userName ? `<p><strong>Ad:</strong> ${escapeHtml(userName)}</p>` : ''}
  ${userId ? `<p><strong>Kullanıcı ID:</strong> ${escapeHtml(userId)}</p>` : ''}
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="color: #666; font-size: 12px;">Yanıtlamak için &quot;Yanıtla&quot; kullanın; alıcı ${escapeHtml(fromEmail)} olarak ayarlanmıştır.</p>
</body>
</html>
`.trim();
}

export type SendSupportContactEmailParams = {
  fromEmail: string;
  userName: string | null;
  userId: string | null;
  category: string;
  categoryLabel: string;
  subject: string;
  message: string;
};

export async function sendSupportContactEmail(params: SendSupportContactEmailParams): Promise<void> {
  const { fromEmail, userName, userId, categoryLabel, subject, message } = params;
  const apiKey = process.env.RESEND_API_KEY;
  const supportInbox = process.env.SUPPORT_INBOX_EMAIL?.trim();
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;

  const logPayload = {
    tag: 'SUPPORT_CONTACT',
    fromEmail,
    userId,
    category: params.category,
    subject,
    messagePreview: message.slice(0, 400),
  };

  if (!apiKey || !supportInbox) {
    logInfo('Support ticket (configure RESEND_API_KEY + SUPPORT_INBOX_EMAIL for email delivery)', logPayload);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const mailSubject = `[The Goal Lab Destek] ${categoryLabel} — ${subject}`.slice(0, 200);
    const { error } = await resend.emails.send({
      from,
      to: [supportInbox],
      replyTo: fromEmail,
      subject: mailSubject,
      html: buildSupportEmailHtml({
        categoryLabel,
        subject,
        message,
        fromEmail,
        userName,
        userId,
      }),
    });
    if (error) {
      logError('Resend support email failed', new Error(JSON.stringify(error)), logPayload);
      logInfo('Support ticket (Resend error, logged)', logPayload);
    } else {
      logInfo('Support email sent', { ...logPayload, to: supportInbox });
    }
  } catch (err) {
    logError('Resend support send exception', err as Error, logPayload);
    logInfo('Support ticket (exception, logged)', logPayload);
  }
}
