/** Şifre değiştirme — istemci doğrulama (sunucu şeması ile uyumlu). */

import { passwordSchema } from '@/lib/validation/schemas';

export type PasswordValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export function validatePasswordChange(
  newPassword: string,
  confirmPassword: string,
): PasswordValidationResult {
  if (newPassword !== confirmPassword) {
    return { valid: false, message: 'Yeni şifreler eşleşmiyor.' };
  }
  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) {
    return { valid: false, message: parsed.error.errors[0]?.message ?? 'Geçersiz şifre.' };
  }
  return { valid: true };
}
