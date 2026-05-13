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
  const res = await fetch('/api/support/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    error?: string | { message?: string };
  };
  if (res.ok && data.success) {
    return { ok: true, message: data.message };
  }
  const errText =
    typeof data.error === 'string'
      ? data.error
      : data.error && typeof data.error === 'object' && 'message' in data.error
        ? String((data.error as { message?: string }).message)
        : 'Gönderilemedi. Tekrar deneyin.';
  return { ok: false, message: errText };
}
