'use client';

import { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
import { startPomodoroSession, completePomodoroSession } from '@/lib/client-api/pomodoroClient';
import { POMODORO_WORK_MINUTES, POMODORO_BREAK_MINUTES } from '@/components/pomodoro/pomodoroConstants';

type UsePomodoroTimerOptions = {
  fetchHistory: (force?: boolean) => Promise<void>;
  soundEnabled: boolean;
  playCompletionSound: () => Promise<void>;
  ensureAudioReady: () => Promise<AudioContext | null>;
};

export function usePomodoroTimer({
  fetchHistory,
  soundEnabled,
  playCompletionSound,
  ensureAudioReady,
}: UsePomodoroTimerOptions) {
  const [remainingSeconds, setRemainingSeconds] = useState(POMODORO_WORK_MINUTES * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completingRef = useRef(false);

  const handleTimerComplete = useCallback(async () => {
    const completedWasBreak = isBreak;

    setIsActive(false);
    if (soundEnabled) void playCompletionSound();

    if (currentSessionId) {
      try {
        await completePomodoroSession(currentSessionId);
      } catch (error) {
        console.error('Failed to complete pomodoro session:', error);
      }
      setCurrentSessionId(null);
    }

    await fetchHistory(true);

    startTransition(() => {
      if (!completedWasBreak) {
        setIsBreak(true);
        setRemainingSeconds(POMODORO_BREAK_MINUTES * 60);
      } else {
        setIsBreak(false);
        setRemainingSeconds(POMODORO_WORK_MINUTES * 60);
      }
    });
  }, [currentSessionId, isBreak, fetchHistory, playCompletionSound, soundEnabled]);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (!completingRef.current) {
            completingRef.current = true;
            void handleTimerComplete().finally(() => {
              completingRef.current = false;
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const onPageHide = (event: PageTransitionEvent) => {
      if (event.persisted) return;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.removeEventListener('pagehide', onPageHide);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, handleTimerComplete]);

  const handleStartPause = useCallback(async () => {
    await ensureAudioReady();

    if (!isActive && remainingSeconds <= 0) {
      setRemainingSeconds(isBreak ? POMODORO_BREAK_MINUTES * 60 : POMODORO_WORK_MINUTES * 60);
    }

    if (!isActive && !currentSessionId) {
      try {
        const started = await startPomodoroSession({
          duration: isBreak ? POMODORO_BREAK_MINUTES : POMODORO_WORK_MINUTES,
          isBreak,
        });
        if (started.ok && started.sessionId) {
          startTransition(() => setCurrentSessionId(started.sessionId!));
        }
      } catch (error) {
        console.error('Failed to start pomodoro session:', error);
        return;
      }
    }
    setIsActive(!isActive);
  }, [isActive, currentSessionId, isBreak, ensureAudioReady, remainingSeconds]);

  const handleReset = useCallback(() => {
    setIsActive(false);
    if (currentSessionId) {
      setCurrentSessionId(null);
    }
    startTransition(() => {
      setIsBreak(false);
      setRemainingSeconds(POMODORO_WORK_MINUTES * 60);
    });
  }, [currentSessionId]);

  const formatTime = useCallback((mins: number, secs: number) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  const phaseTotalSeconds = isBreak ? POMODORO_BREAK_MINUTES * 60 : POMODORO_WORK_MINUTES * 60;
  const displayMinutes = Math.floor(remainingSeconds / 60);
  const displaySeconds = remainingSeconds % 60;

  const progress = useMemo(
    () =>
      phaseTotalSeconds > 0 ? ((phaseTotalSeconds - remainingSeconds) / phaseTotalSeconds) * 100 : 0,
    [phaseTotalSeconds, remainingSeconds],
  );

  return {
    remainingSeconds,
    isActive,
    isBreak,
    handleStartPause,
    handleReset,
    formatTime,
    displayMinutes,
    displaySeconds,
    progress,
  };
}
