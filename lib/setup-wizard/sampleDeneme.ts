/**
 * Kurulum sihirbazı örnek deneme — POST ile aynı değerler (tek kaynak).
 */

export const SETUP_WIZARD_SAMPLE_DENEME = {
  rightCount: 68,
  wrongCount: 16,
  emptyCount: 16,
  durationMinutes: 135,
  /** attemptedAt = şimdi − N gün */
  daysAgo: 4,
  notes: 'Kurulum sihirbazından örnek deneme kaydı',
} as const;

export function setupWizardSampleDenemeNet(): number {
  const { rightCount, wrongCount } = SETUP_WIZARD_SAMPLE_DENEME;
  return rightCount - wrongCount / 4;
}
