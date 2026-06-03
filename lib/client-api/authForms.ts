/**
 * Auth-related POST helpers used by auth pages.
 */

import { fetchJson, jsonInit } from '@/lib/client-api/http';

type AuthErrorBody = { error?: { message?: string }; success?: boolean; message?: string };

export async function postAuthRegister(
  body: Record<string, unknown>,
): Promise<{ ok: boolean; errorMessage?: string }> {
  const { ok, body: result } = await fetchJson<AuthErrorBody>('/api/auth/register', jsonInit('POST', body));
  if (!ok) {
    return { ok: false, errorMessage: result.error?.message || 'Kayıt işlemi başarısız oldu' };
  }
  return { ok: true };
}

export async function postForgotPassword(
  email: string,
): Promise<{ ok: boolean; errorMessage?: string }> {
  const { ok, body: result } = await fetchJson<AuthErrorBody>(
    '/api/auth/forgot-password',
    jsonInit('POST', { email: email.toLowerCase() }),
  );
  if (!ok) {
    return {
      ok: false,
      errorMessage: result.error?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.',
    };
  }
  return { ok: true };
}

export async function postResetPassword(body: {
  token: string;
  password: string;
}): Promise<{ ok: boolean; errorMessage?: string }> {
  const { ok, body: result } = await fetchJson<AuthErrorBody>(
    '/api/auth/reset-password',
    jsonInit('POST', body),
  );
  if (!ok) {
    return {
      ok: false,
      errorMessage: result.error?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.',
    };
  }
  return { ok: true };
}

export async function postVerifyEmail(params: {
  email: string;
  code: string;
}): Promise<{ ok: boolean; success?: boolean; message?: string; errorMessage?: string }> {
  const { ok, body: data } = await fetchJson<AuthErrorBody>(
    '/api/auth/verify-email',
    jsonInit('POST', {
      email: params.email.trim().toLowerCase(),
      code: params.code.trim(),
    }),
  );
  if (ok && data.success) {
    return { ok: true, success: true, message: data.message };
  }
  return {
    ok: false,
    errorMessage:
      data.error?.message || 'Doğrulama yapılamadı. Kod geçersiz veya süresi dolmuş olabilir.',
  };
}

export async function postResendVerification(email: string): Promise<{ message?: string }> {
  const { body: data } = await fetchJson<AuthErrorBody>(
    '/api/auth/resend-verification',
    jsonInit('POST', { email }),
  );
  return { message: data.message || 'İstek alındı.' };
}

/** Yalnızca development — local test için son doğrulama kodu */
export async function fetchDevVerificationCode(email: string): Promise<string | null> {
  if (process.env.NODE_ENV === 'production') return null;
  try {
    const { ok, body } = await fetchJson<{ code?: string | null }>(
      `/api/auth/dev-verification-code?email=${encodeURIComponent(email.trim().toLowerCase())}`,
    );
    if (!ok || !body.code) return null;
    return body.code;
  } catch {
    return null;
  }
}
