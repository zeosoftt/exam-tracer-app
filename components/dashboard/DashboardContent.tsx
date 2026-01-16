/**
 * Dashboard Content Component
 * 3 kartlı modern dashboard tasarımı
 */

'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle,
  Clock,
  LogOut,
  User,
  Target,
  Settings,
  Timer,
  BarChart3,
} from 'lucide-react';

interface DashboardStats {
  totalExams: number;
  activeExams: number;
  completedTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  reviewedTopics: number;
  totalTopics: number;
  totalSubjects: number;
  totalStudyHours: number;
  totalPomodoroSessions: number;
  activeExam: {
    id: string;
    name: string;
    code: string;
  } | null;
  user?: {
    targetScore: number | null;
    dailyStudyHours: number | null;
  };
}

export function DashboardContent({ user }: { user: { id: string; name: string; email: string; role: string } }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Sayfaya odaklanıldığında veya görünür olduğunda verileri yenile
  useEffect(() => {
    const handleFocus = () => {
      fetchStats();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStats();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // API'den gelen totalTopics kullanılıyor
  // Eğer totalTopics yoksa, mevcut progress kayıtlarından hesaplanıyor
  const totalTopics = stats?.totalTopics || (stats?.completedTopics || 0) + (stats?.inProgressTopics || 0) + (stats?.notStartedTopics || 0);
  const completionRate = totalTopics > 0 
    ? Math.round(((stats?.completedTopics || 0) / totalTopics) * 100)
    : 0;

  // Çalışma saatleri artık backend'den geliyor
  const studyHours = stats?.totalStudyHours || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition"></div>
                <BookOpen className="relative h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Exam Tracker
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="font-medium">{user.name}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Hoş geldiniz, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Sınav hazırlığınızın özeti
          </p>
        </div>

        {/* 3 Kart */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3 mb-10">
            {[...Array(3)].map((_, _i) => (
              <div key={_i} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3 mb-10">
            {/* Kart 1: Konu/Ders Tamamlanma Durumları */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white hover:shadow-2xl transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-6">
                <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  İlerleme
                </span>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-sm">Toplam Ders</span>
                  <span className="text-2xl font-bold">{stats?.totalSubjects || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-sm">Toplam Konu</span>
                  <span className="text-2xl font-bold">{stats?.totalTopics || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-sm">Tamamlanan</span>
                  <span className="text-2xl font-bold">{stats?.completedTopics || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-sm">Devam Eden</span>
                  <span className="text-2xl font-bold">{stats?.inProgressTopics || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-sm">Başlanmamış</span>
                  <span className="text-2xl font-bold">{stats?.notStartedTopics || 0}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-100">Tamamlanma Oranı</span>
                  <span className="text-xl font-bold">{completionRate}%</span>
                </div>
              </div>
            </div>

            {/* Kart 2: Çalışma Saati */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-8 text-white hover:shadow-2xl transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-6">
                <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                  <Clock className="h-7 w-7" />
                </div>
                <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  Çalışma
                </span>
              </div>
              <div className="mb-6">
                <p className="text-5xl font-bold mb-2">{studyHours}</p>
                <p className="text-purple-100 text-sm">Toplam Çalışma Saati</p>
              </div>
              {stats?.user?.dailyStudyHours && (
                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-100">Günlük Hedef</span>
                    <span className="text-lg font-bold">{stats.user.dailyStudyHours} saat/gün</span>
                  </div>
                </div>
              )}
            </div>

            {/* Kart 3: Aktif Sınav ve Hedef Puan */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-white hover:shadow-2xl transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-6">
                <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                  <Target className="h-7 w-7" />
                </div>
                <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  Hedef
                </span>
              </div>
              <div className="mb-4">
                {stats?.activeExam ? (
                  <>
                    <p className="text-lg font-semibold text-green-100 mb-1">Aktif Sınav</p>
                    <p className="text-2xl font-bold mb-4">{stats.activeExam.name}</p>
                  </>
                ) : (
                  <p className="text-lg text-green-100 mb-4">Aktif sınav bulunamadı</p>
                )}
                {stats?.user?.targetScore && (
                  <>
                    <div className="pt-4 border-t border-white/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-100">Hedef Puan</span>
                        <span className="text-3xl font-bold">{stats.user.targetScore}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3 Buton */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Detay Görüntüle */}
          <Link
            href="/dashboard/detail"
            className="group bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all flex items-center justify-center gap-3"
          >
            <BarChart3 className="h-5 w-5 text-blue-600 group-hover:text-blue-700 transition-colors" />
            <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Detay Görüntüle</span>
          </Link>

          {/* Pomodoro Sayacı */}
          <Link
            href="/dashboard/pomodoro"
            className="group bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg hover:border-purple-300 transition-all flex items-center justify-center gap-3"
          >
            <Timer className="h-5 w-5 text-purple-600 group-hover:text-purple-700 transition-colors" />
            <span className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Pomodoro</span>
          </Link>

          {/* Ayarlar */}
          <Link
            href="/dashboard/settings"
            className="group bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg hover:border-gray-400 transition-all flex items-center justify-center gap-3"
          >
            <Settings className="h-5 w-5 text-gray-600 group-hover:text-gray-700 transition-colors" />
            <span className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">Ayarlar</span>
          </Link>
        </div>
      </main>
    </div>
  );
}