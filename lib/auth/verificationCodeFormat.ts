export function normalizeVerificationCode(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 6);
}

export function isValidVerificationCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}
