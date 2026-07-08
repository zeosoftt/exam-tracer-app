export function sortDenemeAttemptsByDateDesc<T extends { attemptedAt: string }>(attempts: T[]): T[] {
  return [...attempts].sort(
    (a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime(),
  );
}
