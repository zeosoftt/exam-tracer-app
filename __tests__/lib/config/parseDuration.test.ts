import { parseDurationToSeconds } from '@/config/constants';

describe('parseDurationToSeconds', () => {
  it('parses plain seconds', () => {
    expect(parseDurationToSeconds('3600', 1)).toBe(3600);
  });

  it('parses d h m s suffixes', () => {
    expect(parseDurationToSeconds('2d', 0)).toBe(2 * 86400);
    expect(parseDurationToSeconds('3h', 0)).toBe(3 * 3600);
    expect(parseDurationToSeconds('15m', 0)).toBe(15 * 60);
    expect(parseDurationToSeconds('90s', 0)).toBe(90);
  });

  it('returns fallback on invalid input', () => {
    expect(parseDurationToSeconds('', 42)).toBe(42);
    expect(parseDurationToSeconds('xyz', 99)).toBe(99);
  });
});
