/**
 * Aralıklı tekrar (spaced repetition) — araştırma temelli basit model.
 *
 * Ebbinghaus unutma eğrisi ve modern SRS (SuperMemo, Anki benzeri) uygulamalarında
 * tekrar aralıkları kademeli olarak uzatılır; ilk tekrar kısa, sonrakiler giderek uzun.
 *
 * Bu projede sabit gün aralıkları: 1 → 3 → 7 → 14 → 30 → 60 → 120 gün.
 * İlk tamamlamadan sonra ilk tekrar 1 gün sonra önerilir; kullanıcı “Tekrar ettim”
 * dedikçe seviye artar ve bir sonraki aralık uygulanır.
 */

export const SPACED_REPETITION_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60, 120] as const;

function addDaysUtc(base: Date, days: number): Date {
  const d = new Date(base.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function intervalDaysForLevel(level: number): number {
  const idx = Math.min(Math.max(0, level), SPACED_REPETITION_INTERVALS_DAYS.length - 1);
  return SPACED_REPETITION_INTERVALS_DAYS[idx];
}

/** Konu ilk tamamlandığında: bir sonraki tekrar = tamamlanma + ilk aralık (1 gün). */
export function computeInitialNextReview(completedAt: Date): Date {
  return addDaysUtc(completedAt, intervalDaysForLevel(0));
}

/**
 * Kullanıcı tekrarı tamamladığını işaretlediğinde: seviye +1, sonraki tekrar = şimdi + yeni aralık.
 */
export function advanceAfterReviewAcknowledged(now: Date, currentLevel: number): {
  nextLevel: number;
  nextReviewAt: Date;
} {
  const nextLevel = currentLevel + 1;
  const days = intervalDaysForLevel(nextLevel);
  return {
    nextLevel,
    nextReviewAt: addDaysUtc(now, days),
  };
}

/** Veritabanında nextReviewAt yoksa (eski kayıt): completedAt üzerinden tahmin. */
/** DB'de nextReviewAt yoksa (eski kayıt) completedAt üzerinden ilk tekrar tahmini. */
export function effectiveNextReviewAt(nextReviewAt: Date | null, completedAt: Date | null): Date | null {
  if (nextReviewAt) return nextReviewAt;
  if (!completedAt) return null;
  return computeInitialNextReview(completedAt);
}

export function describeIntervalTurkish(level: number): string {
  const d = intervalDaysForLevel(level);
  if (d === 1) return '1 gün sonra';
  return `${d} gün sonra`;
}
