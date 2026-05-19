'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  createOrReuseAudioContext,
  playPomodoroCompletionChime,
  unlockAudioContext,
} from '@/lib/pomodoro/pomodoroSound';
import { POMODORO_SOUND_KEY } from '@/components/pomodoro/pomodoroConstants';

export function usePomodoroSound() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(POMODORO_SOUND_KEY);
      if (stored !== null) setSoundEnabled(stored === 'true');
    } catch {
      // localStorage erişilemezse varsayılan (açık) kalsın
    }
  }, []);

  const ensureAudioReady = useCallback(async (): Promise<AudioContext | null> => {
    const ctx = createOrReuseAudioContext(audioContextRef.current);
    if (!ctx) return null;
    audioContextRef.current = ctx;
    await unlockAudioContext(ctx);
    return ctx;
  }, []);

  const playCompletionSound = useCallback(async () => {
    try {
      const ctx = await ensureAudioReady();
      if (!ctx) return;
      await playPomodoroCompletionChime(ctx);
    } catch {
      // Ses çalınamazsa sessizce geç
    }
  }, [ensureAudioReady]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(POMODORO_SOUND_KEY, String(next));
      } catch {
        // ignore
      }
      if (next) void playCompletionSound();
      return next;
    });
  }, [playCompletionSound]);

  return { soundEnabled, toggleSound, playCompletionSound, ensureAudioReady };
}
