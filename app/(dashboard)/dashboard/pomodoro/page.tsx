/**
 * Pomodoro Timer Page
 * Odaklı çalışma zamanlayıcısı
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Timer, Play, Pause, RotateCcw } from 'lucide-react';

export default function PomodoroPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleTimerComplete = () => {
    setIsActive(false);
    if (!isBreak) {
      setPomodoroCount((prev) => prev + 1);
      setIsBreak(true);
      setMinutes(5); // 5 dakika mola
      setSeconds(0);
    } else {
      setIsBreak(false);
      setMinutes(25); // 25 dakika çalışma
      setSeconds(0);
    }
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  const formatTime = (mins: number, secs: number) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Odaklı Çalışma Zamanlayıcısı
          </h1>
          <p className="text-lg text-gray-600">
            {isBreak ? 'Mola zamanı! 🎉' : 'Çalışma zamanı! 📚'}
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

        {/* Pomodoro Count */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{pomodoroCount}</div>
            <div className="text-gray-600">Tamamlanan Pomodoro</div>
          </div>
        </div>
      </main>
    </div>
  );
}