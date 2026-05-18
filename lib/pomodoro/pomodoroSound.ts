/** Pomodoro / deneme süre bitişi — Web Audio API */

export function getAudioContextClass(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ||
    null
  );
}

export function createOrReuseAudioContext(existing: AudioContext | null): AudioContext | null {
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) return null;
  return existing ?? new AudioContextClass();
}

export async function unlockAudioContext(ctx: AudioContext): Promise<void> {
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

/** Bip zamanları — ctx.currentTime'a göre (mutlak 0 kullanılmaz). */
export function completionBeepStartTimes(baseTime: number): number[] {
  return [0, 0.22, 0.44].map((offset) => baseTime + offset);
}

const COMPLETION_BEEPS: ReadonlyArray<{ frequency: number; offset: number; duration: number }> = [
  { frequency: 880, offset: 0, duration: 0.15 },
  { frequency: 880, offset: 0.22, duration: 0.15 },
  { frequency: 1100, offset: 0.44, duration: 0.25 },
];

export async function playPomodoroCompletionChime(ctx: AudioContext): Promise<void> {
  await unlockAudioContext(ctx);
  const t0 = ctx.currentTime;

  for (const { frequency, offset, duration } of COMPLETION_BEEPS) {
    const start = t0 + offset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }
}
