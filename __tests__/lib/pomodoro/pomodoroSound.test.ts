import {
  completionBeepStartTimes,
  playPomodoroCompletionChime,
} from '@/lib/pomodoro/pomodoroSound';

describe('completionBeepStartTimes', () => {
  it('offsets beeps from base currentTime', () => {
    expect(completionBeepStartTimes(100)).toEqual([100, 100.22, 100.44]);
  });
});

describe('playPomodoroCompletionChime', () => {
  it('schedules oscillators at currentTime offsets', async () => {
    const startTimes: number[] = [];
    const mockCtx = {
      state: 'running',
      currentTime: 50.5,
      resume: jest.fn().mockResolvedValue(undefined),
      destination: {},
      createOscillator: () => ({
        frequency: { value: 0 },
        type: 'sine',
        connect: jest.fn(),
        start: (when: number) => startTimes.push(when),
        stop: jest.fn(),
      }),
      createGain: () => ({
        gain: {
          setValueAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
        connect: jest.fn(),
      }),
    } as unknown as AudioContext;

    await playPomodoroCompletionChime(mockCtx);

    expect(startTimes).toEqual([50.5, 50.72, 50.94]);
  });

  it('resumes suspended context before playing', async () => {
    const resume = jest.fn().mockResolvedValue(undefined);
    const mockCtx = {
      state: 'suspended',
      currentTime: 0,
      resume,
      destination: {},
      createOscillator: () => ({
        frequency: { value: 0 },
        type: 'sine',
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
      }),
      createGain: () => ({
        gain: {
          setValueAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn(),
        },
        connect: jest.fn(),
      }),
    } as unknown as AudioContext;

    await playPomodoroCompletionChime(mockCtx);
    expect(resume).toHaveBeenCalled();
  });
});
