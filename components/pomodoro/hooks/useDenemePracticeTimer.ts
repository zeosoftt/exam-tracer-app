'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

type UseDenemePracticeTimerOptions = {
  soundEnabled: boolean;
  playCompletionSound: () => Promise<void>;
  ensureAudioReady: () => Promise<AudioContext | null>;
};

export function useDenemePracticeTimer({
  soundEnabled,
  playCompletionSound,
  ensureAudioReady,
}: UseDenemePracticeTimerOptions) {
  const [denemeInitialSeconds, setDenemeInitialSeconds] = useState(90 * 60);
  const [denemeRemainingSec, setDenemeRemainingSec] = useState(90 * 60);
  const [denemeRunning, setDenemeRunning] = useState(false);
  const [denemeCustomMinutes, setDenemeCustomMinutes] = useState('');
  const denemeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!denemeRunning) {
      if (denemeIntervalRef.current) {
        clearInterval(denemeIntervalRef.current);
        denemeIntervalRef.current = null;
      }
      return;
    }

    denemeIntervalRef.current = setInterval(() => {
      setDenemeRemainingSec((r) => {
        if (r <= 0) return 0;
        const next = r - 1;
        if (next === 0) {
          setDenemeRunning(false);
          if (soundEnabled) void playCompletionSound();
        }
        return next;
      });
    }, 1000);

    return () => {
      if (denemeIntervalRef.current) {
        clearInterval(denemeIntervalRef.current);
        denemeIntervalRef.current = null;
      }
    };
  }, [denemeRunning, soundEnabled, playCompletionSound]);

  const applyDenemePreset = useCallback(
    (mins: number) => {
      if (denemeRunning) return;
      const sec = Math.min(480, Math.max(1, mins)) * 60;
      setDenemeInitialSeconds(sec);
      setDenemeRemainingSec(sec);
    },
    [denemeRunning],
  );

  const applyDenemeCustom = useCallback(() => {
    if (denemeRunning) return;
    const parsed = parseInt(denemeCustomMinutes, 10);
    if (Number.isNaN(parsed) || parsed < 1) return;
    applyDenemePreset(Math.min(480, parsed));
    setDenemeCustomMinutes('');
  }, [denemeRunning, denemeCustomMinutes, applyDenemePreset]);

  const toggleDeneme = useCallback(() => {
    void ensureAudioReady();
    if (denemeRemainingSec <= 0) return;
    setDenemeRunning((v) => !v);
  }, [denemeRemainingSec, ensureAudioReady]);

  const resetDeneme = useCallback(() => {
    setDenemeRunning(false);
    setDenemeRemainingSec(denemeInitialSeconds);
  }, [denemeInitialSeconds]);

  const formatDenemeClock = useCallback((totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, []);

  const denemeProgress = useMemo(
    () =>
      denemeInitialSeconds > 0
        ? ((denemeInitialSeconds - denemeRemainingSec) / denemeInitialSeconds) * 100
        : 0,
    [denemeInitialSeconds, denemeRemainingSec],
  );

  return {
    denemeInitialSeconds,
    denemeRemainingSec,
    denemeRunning,
    denemeCustomMinutes,
    setDenemeCustomMinutes,
    applyDenemePreset,
    applyDenemeCustom,
    toggleDeneme,
    resetDeneme,
    formatDenemeClock,
    denemeProgress,
  };
}
