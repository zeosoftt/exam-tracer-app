import { sortDenemeAttemptsByDateDesc } from '@/lib/deneme/sortDenemeAttempts';

describe('sortDenemeAttemptsByDateDesc', () => {
  it('sorts attempts with newest attemptedAt first', () => {
    const sorted = sortDenemeAttemptsByDateDesc([
      { id: '1', attemptedAt: '2024-01-01T12:00:00.000Z' },
      { id: '2', attemptedAt: '2026-03-10T12:00:00.000Z' },
      { id: '3', attemptedAt: '2025-06-15T12:00:00.000Z' },
    ]);

    expect(sorted.map((item) => item.id)).toEqual(['2', '3', '1']);
  });
});
