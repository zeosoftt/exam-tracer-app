import {
  describeStatPeriod,
  formatRelativeSessionDate,
  formatStudyDuration,
  groupSessionsByDay,
} from '@/lib/pomodoro/pomodoroDisplay';

describe('formatStudyDuration', () => {
  it('formats minutes only', () => {
    expect(formatStudyDuration(45)).toBe('45 dk');
    expect(formatStudyDuration(0)).toBe('0 dk');
  });

  it('formats hours and minutes', () => {
    expect(formatStudyDuration(75)).toBe('1 sa 15 dk');
    expect(formatStudyDuration(120)).toBe('2 saat');
  });
});

describe('describeStatPeriod', () => {
  it('describes today stats clearly', () => {
    const copy = describeStatPeriod('today', { sessions: 3, studyMinutes: 75 });
    expect(copy.subtitle).toBe('3 oturum');
    expect(copy.detail).toContain('1 sa 15 dk');
  });

  it('handles empty stats', () => {
    const copy = describeStatPeriod('today', { sessions: 0, studyMinutes: 0 });
    expect(copy.detail).toContain('Henüz');
  });
});

describe('groupSessionsByDay', () => {
  it('groups sessions under day labels', () => {
    const groups = groupSessionsByDay([
      { startedAt: '2026-05-17T10:00:00.000Z' },
      { startedAt: '2026-05-17T14:00:00.000Z' },
      { startedAt: '2026-05-16T10:00:00.000Z' },
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0].sessions).toHaveLength(2);
  });
});

describe('formatRelativeSessionDate', () => {
  it('returns a non-empty label', () => {
    expect(formatRelativeSessionDate(new Date().toISOString())).toMatch(/Bugün/);
  });
});
