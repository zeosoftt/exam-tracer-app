/**
 * Auth-related POST helpers used by auth pages.
 */

export async function postAuthRegister(
  body: Record<string, unknown>,
): Promise<{ ok: boolean; errorMessage?: string }> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      errorMessage: result.error?.message || 'Kayıt işlemi başarısız oldu',
    };
  }
  return { ok: true };
}

export async function postForgotPassword(
  email: string,
): Promise<{ ok: boolean; errorMessage?: string }> {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.toLowerCase() }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
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
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      errorMessage: result.error?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.',
    };
  }
  return { ok: true };
}

export async function postVerifyEmail(
  token: string,
): Promise<{ ok: boolean; success?: boolean; message?: string; errorMessage?: string }> {
  const res = await fetch('/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: token.trim() }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data.success) {
    return { ok: true, success: true, message: data.message };
  }
  return {
    ok: false,
    errorMessage: data.error?.message || 'Doğrulama yapılamadı. Bağlantı geçersiz veya süresi dolmuş olabilir.',
  };
}

export async function postResendVerification(
  email: string,
): Promise<{ message?: string }> {
  const res = await fetch('/api/auth/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  return { message: data.message || 'İstek alındı.' };
}
