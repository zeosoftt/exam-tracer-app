/**
 * Support contact form API.
 */

import { mutateApi } from '@/lib/client-api/http';

export type SupportContactPayload = {
  email: string | null | undefined;
  category: string;
  subject: string;
  message: string;
};

export type SupportContactResult =
  | { ok: true; message?: string }
  | { ok: false; message: string };

export async function submitSupportContact(body: SupportContactPayload): Promise<SupportContactResult> {
  const { ok, result } = await mutateApi<SupportContactPayload, unknown>('/api/support/contact', 'POST', body);
  if (ok) {
    return { ok: true, message: result.message };
  }
  const errText =
    typeof result.error === 'object' && result.error?.message
      ? result.error.message
      : typeof result.error === 'string'
        ? result.error
        : 'Gönderilemedi. Tekrar deneyin.';
  return { ok: false, message: errText };
}
