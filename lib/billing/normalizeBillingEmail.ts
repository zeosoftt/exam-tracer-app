/** Shopier / billing e-posta eşleştirmesi — case + trim normalize. */
export function normalizeBillingEmail(email: string): string {
  return email.toLowerCase().trim();
}
