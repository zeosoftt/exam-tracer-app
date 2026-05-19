/** Şifre değiştirme — istemci doğrulama (iş kuralı). */

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
  if (newPassword.length < 8) {
    return { valid: false, message: 'Yeni şifre en az 8 karakter olmalı.' };
  }
  return { valid: true };
}
