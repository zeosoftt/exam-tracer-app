/**
 * Pomodoro Timer Page
 * Odaklı çalışma zamanlayıcısı - Backend entegreli
 */

'use client';

import { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Calendar,
  TrendingUp,
  History,
  Volume2,
  VolumeX,
  Lock,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';
import {
  fetchPomodoroDashboard,
  startPomodoroSession,
  completePomodoroSession,
} from '@/lib/client-api/pomodoroClient';

const ShopierCheckoutLink = dynamic(
  () => import('@/components/checkout/ShopierCheckoutLink').then((m) => m.ShopierCheckoutLink),
  { ssr: false, loading: () => null },
);

const DENEME_PRESETS = [
  { minutes: 40, label: '40 dk' },
  { minutes: 50, label: '50 dk' },
  { minutes: 75, label: '75 dk' },
  { minutes: 90, label: '90 dk' },
  { minutes: 135, label: '135 dk' },
] as const;

interface PomodoroSession {
  id: string;
  duration: number;
  isBreak: boolean;
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
}

interface PomodoroStats {
  totalSessions: number;
  totalStudyHours: number;
  todaySessions: number;
  todayStudyHours: number;
  weekSessions: number;
  weekStudyHours: number;
}

export default function PomodoroPage() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [history, setHistory] = useState<PomodoroSession[]>([]);
  const [stats, setStats] = useState<PomodoroStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsPremiumRequired, setStatsPremiumRequired] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const denemeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const historyFetchInFlightRef = useRef(false);
  const lastHistoryFetchAtRef = useRef(0);

  /** Kendi denemesi için geri sayım (Pomodoro’dan bağımsız) */
  const [denemeInitialSeconds, setDenemeInitialSeconds] = useState(90 * 60);
  const [denemeRemainingSec, setDenemeRemainingSec] = useState(90 * 60);
  const [denemeRunning, setDenemeRunning] = useState(false);
  const [denemeCustomMinutes, setDenemeCustomMinutes] = useState('');
  const [timerTab, setTimerTab] = useState<'pomodoro' | 'deneme'>('pomodoro');

  const POMODORO_SOUND_KEY = 'pomodoro-sound-enabled';

  useEffect(() => {
    try {
      const stored = localStorage.getItem(POMODORO_SOUND_KEY);
      if (stored !== null) setSoundEnabled(stored === 'true');
    } catch {
      // localStorage erişilemezse varsayılan (açık) kalsın
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(POMODORO_SOUND_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Süre bitince bildirim sesi (Web Audio API)
  const playCompletionSound = useCallback(() => {
    try {
      const AudioContextClass = typeof window !== 'undefined' ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext : null;
      if (!AudioContextClass) return;

      const ctx = audioContextRef.current ?? new AudioContextClass();
      if (!audioContextRef.current) audioContextRef.current = ctx;

      if (ctx.state === 'suspended') ctx.resume();

      const playBeep = (frequency: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = frequency;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      playBeep(880, 0, 0.15);
      playBeep(880, 0.22, 0.15);
      playBeep(1100, 0.44, 0.25);
    } catch {
      // Ses çalınamazsa sessizce geç (örn. autoplay kısıtı)
    }
  }, []);

  // Fetch history and stats (Premium gerekli; freemium'da 403 döner)
  const fetchHistory = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastHistoryFetchAtRef.current < 10000) return;
    if (historyFetchInFlightRef.current) return;
    historyFetchInFlightRef.current = true;
    try {
      const result = await fetchPomodoroDashboard();
      if (result.ok) {
        startTransition(() => {
          setHistory(result.sessions || []);
          setStats(result.stats || null);
          setStatsPremiumRequired(false);
        });
        lastHistoryFetchAtRef.current = Date.now();
      } else if (result.premiumRequired) {
        startTransition(() => {
          setStatsPremiumRequired(true);
          setHistory([]);
          setStats(null);
        });
      }
    } catch (error) {
      console.error('Failed to fetch pomodoro history:', error);
    } finally {
      historyFetchInFlightRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  const handleTimerComplete = useCallback(async () => {
    setIsActive(false);
    if (soundEnabled) playCompletionSound();

    // Complete the session in backend
    if (currentSessionId) {
      try {
        await completePomodoroSession(currentSessionId);
      } catch (error) {
        console.error('Failed to complete pomodoro session:', error);
      }
      setCurrentSessionId(null);
    }

    // Refresh history
    await fetchHistory(true);

    if (!isBreak) {
      startTransition(() => {
        setIsBreak(true);
        setMinutes(5); // 5 dakika mola
        setSeconds(0);
      });
    } else {
      startTransition(() => {
        setIsBreak(false);
        setMinutes(25); // 25 dakika çalışma
        setSeconds(0);
      });
    }
  }, [currentSessionId, isBreak, fetchHistory, playCompletionSound, soundEnabled]);

  // Timer logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev === 0) {
            if (minutes === 0) {
              // Timer bitti
              handleTimerComplete();
              return 0;
            }
            setMinutes((prev) => prev - 1);
            return 59;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, minutes, seconds, handleTimerComplete]);

  // Deneme geri sayımı
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
          if (soundEnabled) playCompletionSound();
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
    if (!audioContextRef.current && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();

    if (denemeRemainingSec <= 0) return;
    setDenemeRunning((v) => !v);
  }, [denemeRemainingSec]);

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

  const handleStartPause = useCallback(async () => {
    // Kullanıcı etkileşiminde ses bağlamını hazırla (süre bitince ses çalınabilsin)
    if (!audioContextRef.current && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();

    if (!isActive && !currentSessionId) {
      // Start new session
      try {
        const started = await startPomodoroSession({
          duration: isBreak ? 5 : 25,
          isBreak,
        });
        if (started.ok && started.sessionId) {
          const id = started.sessionId;
          startTransition(() => setCurrentSessionId(id));
        }
      } catch (error) {
        console.error('Failed to start pomodoro session:', error);
        return;
      }
    }
    setIsActive(!isActive);
  }, [isActive, currentSessionId, isBreak]);

  const handleReset = useCallback(() => {
    setIsActive(false);

    if (currentSessionId) {
      setCurrentSessionId(null);
    }

    startTransition(() => {
      setIsBreak(false);
      setMinutes(25);
      setSeconds(0);
    });
  }, [currentSessionId]);

  const formatTime = useCallback((mins: number, secs: number) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const progress = useMemo(
    () =>
      isBreak
        ? ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100
        : ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100,
    [isBreak, minutes, seconds],
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="border-b border-stone-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-stone-700 transition-colors hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Geri</span>
            </Link>
            <div className="flex items-center gap-2">
              <Timer className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden />
              <span className="text-xl font-bold text-stone-900 dark:text-stone-100">Pomodoro</span>
            </div>
            <div className="flex w-20 justify-end">
              <ThemeToggleCompact />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          {/* Dikey sekme + tek panel (sayfa uzamaz; içerik alanında kaydırma) */}
          <div className="lg:col-span-2">
            <div className="flex h-[min(78vh,calc(100vh-7rem))] min-h-[28rem] flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lg dark:border-stone-800 dark:bg-stone-900/90 lg:flex-row">
              <nav
                className="flex shrink-0 gap-1 border-b border-stone-200 bg-stone-50/95 p-2 dark:border-stone-800 dark:bg-stone-950/80 lg:w-[3.75rem] lg:flex-col lg:border-b-0 lg:border-r lg:px-1 lg:py-3"
                aria-label="Zamanlayıcı modu"
              >
                <button
                  type="button"
                  onClick={() => setTimerTab('pomodoro')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition lg:flex-1 lg:flex-col lg:justify-center lg:gap-0 lg:py-6 lg:px-0.5 ${
                    timerTab === 'pomodoro'
                      ? 'bg-white text-primary-700 shadow-sm ring-1 ring-stone-200/80 dark:bg-stone-900 dark:text-primary-300 dark:ring-stone-700 lg:border-l-[3px] lg:border-l-primary-600 lg:ring-0'
                      : 'text-stone-600 hover:bg-white/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/80 dark:hover:text-stone-100'
                  }`}
                >
                  <Timer className="h-5 w-5 shrink-0 opacity-90 lg:mb-3 lg:h-6 lg:w-6" aria-hidden />
                  <span className="font-display lg:hidden">Pomodoro</span>
                  <div className="hidden lg:flex lg:min-h-[5.5rem] lg:w-full lg:flex-1 lg:items-center lg:justify-center">
                    <span
                      className={`origin-center -rotate-90 select-none whitespace-nowrap font-display text-[10px] font-bold uppercase tracking-[0.42em] ${
                        timerTab === 'pomodoro' ? 'text-primary-800 dark:text-primary-300' : 'text-stone-500 dark:text-stone-500'
                      }`}
                    >
                      Pomodoro
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTimerTab('deneme')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition lg:flex-1 lg:flex-col lg:justify-center lg:gap-0 lg:py-6 lg:px-0.5 ${
                    timerTab === 'deneme'
                      ? 'bg-white text-accent-800 shadow-sm ring-1 ring-stone-200/80 dark:bg-stone-900 dark:text-accent-300 dark:ring-stone-700 lg:border-l-[3px] lg:border-l-accent-600 lg:ring-0'
                      : 'text-stone-600 hover:bg-white/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/80 dark:hover:text-stone-100'
                  }`}
                >
                  <ClipboardList className="h-5 w-5 shrink-0 opacity-90 lg:mb-3 lg:h-6 lg:w-6" aria-hidden />
                  <span className="font-display lg:hidden">Deneme</span>
                  <div className="hidden lg:flex lg:min-h-[4.5rem] lg:w-full lg:flex-1 lg:items-center lg:justify-center">
                    <span
                      className={`origin-center -rotate-90 select-none whitespace-nowrap font-display text-[10px] font-bold uppercase tracking-[0.42em] ${
                        timerTab === 'deneme' ? 'text-accent-900 dark:text-accent-300' : 'text-stone-500 dark:text-stone-500'
                      }`}
                    >
                      Deneme
                    </span>
                  </div>
                </button>
              </nav>

              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {timerTab === 'pomodoro' && (
                  <div className="p-5 sm:p-7">
                    <div className="mb-6 text-center">
                      <h1 className="font-display text-2xl font-extrabold text-stone-900 dark:text-stone-100 sm:text-3xl">
                        Odaklı çalışma
                      </h1>
                      <p className="mt-1 text-stone-600 dark:text-stone-400">
                        {isBreak ? 'Mola zamanı! 🎉' : 'Çalışma zamanı!'}
                      </p>
                    </div>

                    <div className="mb-6 flex justify-center">
                      <div className="relative h-64 w-64 sm:h-72 sm:w-72">
                        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 320 320">
                          <circle
                            cx="160"
                            cy="160"
                            r="140"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="text-stone-200 dark:text-stone-700"
                          />
                          <circle
                            cx="160"
                            cy="160"
                            r="140"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 140}`}
                            strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
                            className={`transition-all duration-1000 ${isBreak ? 'text-accent-500' : 'text-primary-600'}`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div
                            className={`text-5xl font-bold tabular-nums sm:text-6xl ${
                              isBreak ? 'text-accent-600' : 'text-primary-600'
                            }`}
                          >
                            {formatTime(minutes, seconds)}
                          </div>
                          <div className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
                            {isBreak ? 'Mola' : 'Çalışma'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6 flex flex-wrap justify-center gap-3">
                      <button
                        onClick={handleStartPause}
                        className={`flex items-center gap-2 rounded-2xl px-7 py-3.5 font-bold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl ${
                          isBreak
                            ? 'bg-gradient-to-r from-pink-500 to-pink-600'
                            : 'bg-gradient-to-r from-primary-500 to-primary-600'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Pause className="h-5 w-5" />
                            Duraklat
                          </>
                        ) : (
                          <>
                            <Play className="h-5 w-5" />
                            Başlat
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-2 rounded-2xl border-2 border-stone-200 bg-white px-7 py-3.5 font-bold text-stone-700 shadow-md transition hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                      >
                        <RotateCcw className="h-5 w-5" />
                        Sıfırla
                      </button>
                    </div>

                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={toggleSound}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                          soundEnabled
                            ? 'text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/40'
                            : 'text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800'
                        }`}
                        title={soundEnabled ? 'Süre bitince ses çalar' : 'Ses kapalı'}
                      >
                        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        <span>{soundEnabled ? 'Ses açık' : 'Ses kapalı'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {timerTab === 'deneme' && (
                  <section
                    className="border-t border-violet-100/80 bg-gradient-to-br from-violet-50/50 via-white to-indigo-50/30 p-5 dark:border-violet-900/30 dark:from-violet-950/40 dark:via-stone-900 dark:to-indigo-950/30 sm:p-7 lg:border-t-0"
                    aria-label="Deneme süresi sayacı"
                  >
                    <div className="mb-5 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                        <ClipboardList className="h-5 w-5" aria-hidden />
                      </div>
                      <div>
                        <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 sm:text-xl">Deneme sayacı</h2>
                        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                          Kendi denemeniz için geri sayım. Pomodoro ile bağımsız; süre dolunca ses açıksa uyarı çalar.
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {DENEME_PRESETS.map(({ minutes, label }) => (
                        <button
                          key={minutes}
                          type="button"
                          disabled={denemeRunning}
                          onClick={() => applyDenemePreset(minutes)}
                          className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm font-semibold text-violet-900 shadow-sm transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-800 dark:bg-stone-800 dark:text-violet-200 dark:hover:bg-violet-950/40"
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end">
                      <label className="flex flex-1 flex-col gap-1 text-sm text-stone-600 dark:text-stone-400">
                        <span className="font-medium text-stone-700 dark:text-stone-300">Özel süre (dk)</span>
                        <input
                          type="number"
                          min={1}
                          max={480}
                          placeholder="Örn. 100"
                          disabled={denemeRunning}
                          value={denemeCustomMinutes}
                          onChange={(e) => setDenemeCustomMinutes(e.target.value)}
                          className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-stone-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:opacity-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:focus:ring-violet-900/40"
                        />
                      </label>
                      <button
                        type="button"
                        disabled={denemeRunning}
                        onClick={applyDenemeCustom}
                        className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50 sm:shrink-0"
                      >
                        Uygula
                      </button>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="relative mb-5 h-56 w-56 sm:h-64 sm:w-64">
                        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 320 320">
                          <circle
                            cx="160"
                            cy="160"
                            r="132"
                            stroke="currentColor"
                            strokeWidth="10"
                            fill="none"
                            className="text-violet-100 dark:text-violet-900/40"
                          />
                          <circle
                            cx="160"
                            cy="160"
                            r="132"
                            stroke="currentColor"
                            strokeWidth="10"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 132}`}
                            strokeDashoffset={`${2 * Math.PI * 132 * (1 - denemeProgress / 100)}`}
                            className="text-violet-600 transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-bold tabular-nums text-violet-950 dark:text-violet-100 sm:text-5xl">
                            {formatDenemeClock(denemeRemainingSec)}
                          </span>
                          <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-violet-700/80 dark:text-violet-300/90">
                            {denemeRunning ? 'Deneme sürüyor' : denemeRemainingSec === 0 ? 'Süre doldu' : 'Hazır'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center gap-3">
                        <button
                          type="button"
                          onClick={toggleDeneme}
                          disabled={denemeRemainingSec === 0}
                          className="flex items-center gap-2 rounded-2xl bg-violet-600 px-7 py-3.5 font-bold text-white shadow-lg transition hover:bg-violet-700 disabled:pointer-events-none disabled:opacity-40"
                        >
                          {denemeRunning ? (
                            <>
                              <Pause className="h-5 w-5" />
                              Duraklat
                            </>
                          ) : (
                            <>
                              <Play className="h-5 w-5" />
                              Başlat
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={resetDeneme}
                          disabled={!denemeRunning && denemeRemainingSec === denemeInitialSeconds}
                          className="flex items-center gap-2 rounded-2xl border-2 border-stone-200 bg-white px-7 py-3.5 font-bold text-stone-700 shadow-md transition hover:bg-stone-50 disabled:opacity-40 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                        >
                          <RotateCcw className="h-5 w-5" />
                          Sıfırla
                        </button>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>

          {/* Stats & History Section — Freemium'da Premium CTA */}
            <div className="space-y-6">
            {statsPremiumRequired ? (
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-6 shadow-lg dark:border-amber-900/40 dark:from-amber-950/40 dark:to-orange-950/30">
                <div className="mb-3 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">İstatistikler Premium&apos;da</h2>
                </div>
                <p className="mb-4 text-sm text-stone-600 dark:text-stone-400">
                  Pomodoro istatistikleri ve oturum geçmişi Premium plan özelliğidir. Görüntülemek için Premium&apos;a yükseltin.
                </p>
                <ShopierCheckoutLink className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600">
                  <Sparkles className="h-4 w-4" />
                  Pro&apos;yu Shopier&apos;da satın al
                </ShopierCheckoutLink>
              </div>
            ) : (
              <>
            <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-lg dark:border-stone-800 dark:bg-stone-900/90">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">İstatistikler</h2>
              </div>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800"></div>
                  ))}
                </div>
              ) : stats ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-primary-100 bg-gradient-to-br bg-primary-50 p-4 dark:border-primary-900/40 dark:bg-primary-950/30">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm text-stone-600 dark:text-stone-400">
                        <Clock className="h-4 w-4" />
                        Bugün
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-primary-600">{stats.todaySessions}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">{stats.todayStudyHours} saat</div>
                  </div>
                  
                  <div className="rounded-lg border border-primary-100 bg-gradient-to-br bg-primary-50 p-4 dark:border-primary-900/40 dark:bg-primary-950/30">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm text-stone-600 dark:text-stone-400">
                        <Calendar className="h-4 w-4" />
                        Bu Hafta
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-primary-600">{stats.weekSessions}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">{stats.weekStudyHours} saat</div>
                  </div>
                  
                  <div className="rounded-lg border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-green-900/40 dark:from-green-950/30 dark:to-emerald-950/20">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm text-stone-600 dark:text-stone-400">
                        <TrendingUp className="h-4 w-4" />
                        Toplam
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{stats.totalSessions}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">{stats.totalStudyHours} saat</div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-500 dark:text-stone-400">İstatistik yükleniyor...</p>
              )}
            </div>

            {/* History Section */}
            <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-lg dark:border-stone-800 dark:bg-stone-900/90">
              <div className="mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Son Oturumlar</h2>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800"></div>
                  ))}
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.map((session) => (
                    <div
                      key={session.id}
                      className={`rounded-lg border p-3 ${
                        session.completed
                          ? session.isBreak
                            ? 'border-accent-200 bg-accent-50 dark:border-accent-900/50 dark:bg-accent-950/30'
                            : 'border-primary-200 bg-primary-50 dark:border-primary-900/50 dark:bg-primary-950/30'
                          : 'border-stone-200 bg-gray-50 dark:border-stone-700 dark:bg-stone-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              session.completed
                                ? session.isBreak
                                  ? 'bg-pink-500'
                                  : 'bg-primary-500'
                                : 'bg-stone-400'
                            }`}
                          ></div>
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                            {session.isBreak ? 'Mola' : 'Çalışma'} - {session.duration} dk
                          </span>
                        </div>
                        {session.completed && (
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400">✓ Tamamlandı</span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                        {formatDate(session.startedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-stone-500 dark:text-stone-400">
                  Henüz oturum kaydı bulunmuyor
                </p>
              )}
            </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
