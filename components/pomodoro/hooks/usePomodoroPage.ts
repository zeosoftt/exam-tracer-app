'use client';

import { useState } from 'react';
import type { PomodoroTimerTab } from '@/components/pomodoro/pomodoroTypes';
import { usePomodoroSound } from '@/components/pomodoro/hooks/usePomodoroSound';
import { usePomodoroDashboard } from '@/components/pomodoro/hooks/usePomodoroDashboard';
import { usePomodoroTimer } from '@/components/pomodoro/hooks/usePomodoroTimer';
import { useDenemePracticeTimer } from '@/components/pomodoro/hooks/useDenemePracticeTimer';

export function usePomodoroPage() {
  const [timerTab, setTimerTab] = useState<PomodoroTimerTab>('pomodoro');

  const sound = usePomodoroSound();
  const dashboard = usePomodoroDashboard();
  const pomodoroTimer = usePomodoroTimer({
    fetchHistory: dashboard.fetchHistory,
    soundEnabled: sound.soundEnabled,
    playCompletionSound: sound.playCompletionSound,
    ensureAudioReady: sound.ensureAudioReady,
  });
  const denemeTimer = useDenemePracticeTimer({
    soundEnabled: sound.soundEnabled,
    playCompletionSound: sound.playCompletionSound,
    ensureAudioReady: sound.ensureAudioReady,
  });

  return {
    timerTab,
    setTimerTab,
    ...sound,
    ...dashboard,
    ...pomodoroTimer,
    ...denemeTimer,
  };
}

export type PomodoroPageState = ReturnType<typeof usePomodoroPage>;
