/**
 * Auth-related POST helpers used by auth pages.
 */

import { fetchJson, jsonInit } from '@/lib/client-api/http';

type AuthApiBody = {
  success?: boolean;
  data?: { message?: string; [key: string]: unknown };
  message?: string;
  errors?: Array<{ field?: string; message: string }>;
  error?: { message?: string } | string;
};

function parseAuthError(body: AuthApiBody, fallback: string): string {
  if (body.message) return body.message;
  if (typeof body.error === 'string') return body.error;
  if (body.error && typeof body.error === 'object' && body.error.message) return body.error.message;
  if (body.errors?.[0]?.message) return body.errors[0].message;
  return fallback;
}

function parseAuthMessage(body: AuthApiBody, fallback: string): string {
  return body.data?.message ?? body.message ?? fallback;
}

export async function postAuthRegister(
  body: Record<string, unknown>,
): Promise<{ ok: boolean; errorMessage?: string }> {
  const { ok, body: result } = await fetchJson<AuthApiBody>('/api/auth/register', jsonInit('POST', body));
  if (!ok) {
    return { ok: false, errorMessage: parseAuthError(result, 'Kayıt işlemi başarısız oldu') };
  }
  return { ok: true };
}

export async function postForgotPassword(
  email: string,
): Promise<{ ok: boolean; errorMessage?: string }> {
  const { ok, body: result } = await fetchJson<AuthApiBody>(
    '/api/auth/forgot-password',
    jsonInit('POST', { email: email.toLowerCase() }),
  );
  if (!ok) {
    return { ok: false, errorMessage: parseAuthError(result, 'Bir hata oluştu. Lütfen tekrar deneyin.') };
  }
  return { ok: true };
}

export async function postResetPassword(body: {
  token: string;
  password: string;
}): Promise<{ ok: boolean; errorMessage?: string }> {
  const { ok, body: result } = await fetchJson<AuthApiBody>(
    '/api/auth/reset-password',
    jsonInit('POST', body),
  );
  if (!ok) {
    return { ok: false, errorMessage: parseAuthError(result, 'Bir hata oluştu. Lütfen tekrar deneyin.') };
  }
  return { ok: true };
}

export async function postVerifyEmail(params: {
  email: string;
  code: string;
}): Promise<{ ok: boolean; success?: boolean; message?: string; errorMessage?: string }> {
  const { ok, body: data } = await fetchJson<AuthApiBody>(
    '/api/auth/verify-email',
    jsonInit('POST', {
      email: params.email.trim().toLowerCase(),
      code: params.code.trim(),
    }),
  );
  if (ok && data.success !== false) {
    return { ok: true, success: true, message: parseAuthMessage(data, 'E-posta doğrulandı.') };
  }
  return {
    ok: false,
    errorMessage: parseAuthError(data, 'Doğrulama yapılamadı. Kod geçersiz veya süresi dolmuş olabilir.'),
  };
}

export async function postResendVerification(email: string): Promise<{ message?: string }> {
  const { body: data } = await fetchJson<AuthApiBody>(
    '/api/auth/resend-verification',
    jsonInit('POST', { email }),
  );
  return { message: parseAuthMessage(data, 'İstek alındı.') };
}

/** Yalnızca development — local test için son doğrulama kodu */
export async function fetchDevVerificationCode(email: string): Promise<string | null> {
  if (process.env.NODE_ENV === 'production') return null;
  try {
    const { ok, body } = await fetchJson<{ data?: { code?: string | null }; code?: string | null }>(
      `/api/auth/dev-verification-code?email=${encodeURIComponent(email.trim().toLowerCase())}`,
    );
    if (!ok) return null;
    return body.data?.code ?? body.code ?? null;
  } catch {
    return null;
  }
}
