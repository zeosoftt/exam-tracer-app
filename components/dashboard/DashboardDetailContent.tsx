/**
 * Dashboard Detail Content Component
 * Detaylı dashboard ekranı - Codecademy-inspired UI
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  LogOut,
  User,
  ArrowLeft,
  BarChart3,
  Target,
  Calendar,
  FileText,
  Award,
  Activity,
} from 'lucide-react';

interface DashboardStats {
  totalExams: number;
  activeExams: number;
  completedTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  reviewedTopics: number;
  totalTopics: number;
  user?: {
    targetScore: number | null;
    dailyStudyHours: number | null;
  };
}

interface ExamInfo {
  id: string;
  name: string;
  code: string;
  status: string;
  subjectsCount?: number;
  topicsCount?: number;
  progressPercentage?: number;
}

export function DashboardDetailContent({
  user,
}: {
  user: { id: string; name: string; email: string; role: string };
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [exams, setExams] = useState<ExamInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsResponse, examsResponse] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/exams'),
        ]);

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data);
        }

        if (examsResponse.ok) {
          const examsData = await examsResponse.json();
          setExams(examsData.data?.exams || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const totalTopics = stats?.totalTopics || 0;

  const completionRate = totalTopics
    ? Math.round(((stats?.completedTopics || 0) / totalTopics) * 100)
    : 0;

  const progressRate = totalTopics
    ? Math.round(
        (((stats?.completedTopics || 0) + (stats?.inProgressTopics || 0)) / totalTopics) * 100
      )
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Özet Ekrana Dön
        </Link>

        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-extrabold text-gray-900">Detaylı İstatistikler</h1>
          </div>
          <p className="text-lg text-gray-600">Tüm sınavlarınızın ve ilerlemenizin kapsamlı analizi</p>
        </div>

        {/* İstatistikler Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse"
              >
                <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
            {/* Toplam Sınav */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.totalExams || 0}</p>
              <p className="text-sm text-gray-600">Toplam Sınav</p>
            </div>

            {/* Aktif Sınavlar */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.activeExams || 0}</p>
              <p className="text-sm text-gray-600">Aktif Sınav</p>
            </div>

            {/* Tamamlanan Konular */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.completedTopics || 0}
              </p>
              <p className="text-sm text-gray-600">Tamamlanan Konu</p>
            </div>

            {/* Devam Eden Konular */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-yellow-100 p-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.inProgressTopics || 0}
              </p>
              <p className="text-sm text-gray-600">Devam Eden Konu</p>
            </div>

            {/* Başlanmayan Konular */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-gray-100 p-3">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.notStartedTopics || 0}
              </p>
              <p className="text-sm text-gray-600">Başlanmayan Konu</p>
            </div>

            {/* Gözden Geçirilen Konular */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-purple-100 p-3">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {stats?.reviewedTopics || 0}
              </p>
              <p className="text-sm text-gray-600">Gözden Geçirilen</p>
            </div>

            {/* Tamamlanma Oranı */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-white/20 p-3">
                  <Target className="h-6 w-6" />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{completionRate}%</p>
              <p className="text-sm text-green-100">Tamamlanma Oranı</p>
            </div>

            {/* Genel İlerleme */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-white/20 p-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{progressRate}%</p>
              <p className="text-sm text-blue-100">Genel İlerleme</p>
            </div>
          </div>
        )}

        {/* Hedefler */}
        {!isLoading && (stats?.user?.targetScore || stats?.user?.dailyStudyHours) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              Hedefleriniz
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {stats.user?.targetScore && (
                <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="rounded-full bg-blue-100 p-4">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Hedef Puan</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.user.targetScore}</p>
                  </div>
                </div>
              )}
              {stats.user?.dailyStudyHours && (
                <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="rounded-full bg-purple-100 p-4">
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Günlük Çalışma Hedefi</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.user.dailyStudyHours} saat</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* İlerleme Çubukları */}
        {!isLoading && totalTopics > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              İlerleme Özeti
            </h2>

            <div className="space-y-6">
              {/* Tamamlanan */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Tamamlanan Konular
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats?.completedTopics || 0} / {totalTopics}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(stats?.completedTopics || 0) / totalTopics * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Devam Eden */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    Devam Eden Konular
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats?.inProgressTopics || 0} / {totalTopics}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(stats?.inProgressTopics || 0) / totalTopics * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Başlanmayan */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    Başlanmayan Konular
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats?.notStartedTopics || 0} / {totalTopics}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gray-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(stats?.notStartedTopics || 0) / totalTopics * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Gözden Geçirilen */}
              {(stats?.reviewedTopics || 0) > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      Gözden Geçirilen Konular
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {stats?.reviewedTopics || 0} / {totalTopics}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(stats?.reviewedTopics || 0) / totalTopics * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sınavlar Listesi */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Sınavlarım
            </h2>
            <Link
              href="/dashboard/exams"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Tümünü Gör →
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                  <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Henüz sınavınız bulunmuyor</p>
              <Link
                href="/dashboard/exams/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                İlk Sınavınızı Ekleyin
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.slice(0, 5).map((exam) => (
                <Link
                  key={exam.id}
                  href={`/dashboard/exams/${exam.id}`}
                  className="block bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {exam.name}
                        </h3>
                        <span className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded">
                          {exam.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {exam.subjectsCount || 0} Ders
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {exam.topicsCount || 0} Konu
                        </span>
                        {exam.progressPercentage !== undefined && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            %{exam.progressPercentage} Tamamlandı
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          exam.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : exam.status === 'ARCHIVED'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {exam.status === 'ACTIVE' ? 'Aktif' : exam.status === 'ARCHIVED' ? 'Arşiv' : 'Pasif'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
