/**
 * Pomodoro Timer Page
 * Odaklı çalışma zamanlayıcısı - Backend entegreli
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Timer, Play, Pause, RotateCcw, Clock, Calendar, TrendingUp, History } from 'lucide-react';

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
  const { data: session } = useSession();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [history, setHistory] = useState<PomodoroSession[]>([]);
  const [stats, setStats] = useState<PomodoroStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch history and stats
  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/pomodoro?limit=10&page=1');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.data.sessions || []);
        setStats(data.data.stats || null);
      }
    } catch (error) {
      console.error('Failed to fetch pomodoro history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    
    // Complete the session in backend
    if (currentSessionId) {
      try {
        await fetch(`/api/pomodoro/${currentSessionId}`, {
          method: 'PATCH',
        });
      } catch (error) {
        console.error('Failed to complete pomodoro session:', error);
      }
      setCurrentSessionId(null);
    }

    // Refresh history
    await fetchHistory();

    if (!isBreak) {
      setIsBreak(true);
      setMinutes(5); // 5 dakika mola
      setSeconds(0);
    } else {
      setIsBreak(false);
      setMinutes(25); // 25 dakika çalışma
      setSeconds(0);
    }
  };

  const handleStartPause = async () => {
    if (!isActive && !currentSessionId) {
      // Start new session
      try {
        const response = await fetch('/api/pomodoro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            duration: isBreak ? 5 : 25,
            isBreak,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentSessionId(data.data.id);
        }
      } catch (error) {
        console.error('Failed to start pomodoro session:', error);
        return;
      }
    }
    setIsActive(!isActive);
  };

  const handleReset = async () => {
    setIsActive(false);
    
    // Cancel current session if exists
    if (currentSessionId) {
      setCurrentSessionId(null);
    }

    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  const formatTime = (mins: number, secs: number) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const progress = isBreak
    ? ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100
    : ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Geri</span>
            </Link>
            <div className="flex items-center gap-2">
              <Timer className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Pomodoro Timer
              </span>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Timer Section */}
          <div className="lg:col-span-2">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                Odaklı Çalışma Zamanlayıcısı
              </h1>
              <p className="text-lg text-gray-600">
                {isBreak ? 'Mola zamanı! 🎉' : 'Çalışma zamanı! '}
              </p>
            </div>

            {/* Timer Circle */}
            <div className="flex justify-center mb-12">
              <div className="relative w-80 h-80">
                {/* Progress Circle */}
                <svg className="transform -rotate-90 w-80 h-80">
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
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
                    className={`transition-all duration-1000 ${isBreak ? 'text-pink-500' : 'text-purple-600'}`}
                  />
                </svg>
                
                {/* Timer Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-6xl font-bold mb-2 ${isBreak ? 'text-pink-600' : 'text-purple-600'}`}>
                    {formatTime(minutes, seconds)}
                  </div>
                  <div className="text-sm text-gray-500 uppercase font-semibold">
                    {isBreak ? 'Mola' : 'Çalışma'}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mb-12">
              <button
                onClick={handleStartPause}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
                  isBreak
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600'
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
                className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all hover:scale-105 shadow-lg"
              >
                <RotateCcw className="h-5 w-5" />
                Sıfırla
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-900">İstatistikler</h2>
              </div>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : stats ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Bugün
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{stats.todaySessions}</div>
                    <div className="text-xs text-gray-500">{stats.todayStudyHours} saat</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Bu Hafta
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{stats.weekSessions}</div>
                    <div className="text-xs text-gray-500">{stats.weekStudyHours} saat</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Toplam
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{stats.totalSessions}</div>
                    <div className="text-xs text-gray-500">{stats.totalStudyHours} saat</div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">İstatistik yükleniyor...</p>
              )}
            </div>

            {/* History Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-900">Son Oturumlar</h2>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg border ${
                        session.completed
                          ? session.isBreak
                            ? 'bg-pink-50 border-pink-200'
                            : 'bg-purple-50 border-purple-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              session.completed
                                ? session.isBreak
                                  ? 'bg-pink-500'
                                  : 'bg-purple-500'
                                : 'bg-gray-400'
                            }`}
                          ></div>
                          <span className="text-sm font-medium text-gray-900">
                            {session.isBreak ? 'Mola' : 'Çalışma'} - {session.duration} dk
                          </span>
                        </div>
                        {session.completed && (
                          <span className="text-xs text-green-600 font-semibold">✓ Tamamlandı</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(session.startedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  Henüz oturum kaydı bulunmuyor
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
