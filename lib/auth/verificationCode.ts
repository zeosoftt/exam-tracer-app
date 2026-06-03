import { randomInt } from 'crypto';
import { isValidVerificationCode, normalizeVerificationCode } from '@/lib/auth/verificationCodeFormat';

export { isValidVerificationCode, normalizeVerificationCode };

/** 6 haneli e-posta doğrulama kodu üretir (100000–999999). */
export function generateEmailVerificationCode(): string {
  return String(randomInt(100_000, 1_000_000));
}
