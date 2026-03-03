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
  TrendingUp,
  RefreshCw,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Circle,
  Shield,
} from 'lucide-react';

interface StudyDay {
  date: string;
  dayName: string;
  minutesStudied: number;
  goalMinutes: number;
  completed: boolean;
  hoursStudied: number;
}

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
  study?: {
    dailyStudyHoursGoal: number;
    weeklySummary: StudyDay[];
  };
  deneme?: {
    totalAttempts: number;
    lastAttemptAt: string | null;
    lastAttemptScore: number | null;
    lastAttemptNet: number | null;
    lastAttemptExamName: string | null;
  };
  evaluation?: {
    totalTopics: number;
    goodTopics: number;
    improvableTopics: number;
    repeatTopics: number;
    averageSuccessRate: number;
    averageNet: number;
    targetScore: number;
    requiredNet: number;
    requiredSuccessRate: number;
    topics?: Array<{
      topicId: string;
      topicName: string;
      sectionName: string;
      subjectName: string;
      totalQuestions: number;
      correctAnswers: number;
      wrongAnswers: number;
      status?: string | null;
      topicSuccessRate?: number | null;
      topicNet?: number | null;
    }>;
  } | null;
}

export function DashboardContent({ user }: { user: { id: string; name: string; email: string; role?: string } }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [planBadge, setPlanBadge] = useState<{
    code: string;
    label: string;
    bgClass: string;
    textClass: string;
    dotClass: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
  } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [evaluationFilter, setEvaluationFilter] = useState<'GOOD' | 'IMPROVABLE' | 'REPEAT' | null>(null);

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

  // Kullanıcının planını yükle (FREE / PRO / ENTERPRISE) ve header'da rozet olarak göster
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/billing/plan');
        if (!res.ok) return;
        const json = await res.json();
        if (!json.success || !json.data) return;
        const code: string = json.data.planCode ?? '';
        let badge:
          | {
              code: string;
              label: string;
              bgClass: string;
              textClass: string;
              dotClass: string;
            }
          | null = null;

        if (code === 'FREE') {
          badge = {
            code,
            label: 'Free',
            bgClass: 'bg-gray-100',
            textClass: 'text-gray-700',
            dotClass: 'bg-gray-400',
          };
        } else if (code === 'PRO') {
          badge = {
            code,
            label: 'Pro',
            bgClass: 'bg-amber-100',
            textClass: 'text-amber-800',
            dotClass: 'bg-amber-500',
          };
        } else if (code === 'ENTERPRISE') {
          badge = {
            code,
            label: 'Enterprise',
            bgClass: 'bg-purple-100',
            textClass: 'text-purple-800',
            dotClass: 'bg-purple-500',
          };
        }

        if (!cancelled && badge) {
          setPlanBadge(badge);
        }
      } catch {
        // sessizce yut – plan rozeti opsiyonel
      }
    })();

    return () => {
      cancelled = true;
    };
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

  // Soru sayılarını güncelle
  const updateQuestionStats = async (topicId: string) => {
    if (!editValues) return;

    try {
      // Validasyon
      if (editValues.correctAnswers + editValues.wrongAnswers > editValues.totalQuestions) {
        alert('Doğru + Yanlış sayısı toplam soru sayısını geçemez!');
        return;
      }

      const response = await fetch(`/api/progress/${topicId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalQuestions: editValues.totalQuestions,
          correctAnswers: editValues.correctAnswers,
          wrongAnswers: editValues.wrongAnswers,
        }),
      });

      if (response.ok) {
        // Verileri yeniden yükle
        await fetchStats();
        setEditingTopicId(null);
        setEditValues(null);
      } else {
        const error = await response.json();
        console.error('Failed to update question stats:', error);
        alert('Soru sayıları güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error updating question stats:', error);
      alert('Soru sayıları güncellenirken bir hata oluştu');
    }
  };

  // Edit modunu başlat
  const startEdit = (topic: { topicId: string; totalQuestions: number; correctAnswers: number; wrongAnswers: number }) => {
    setEditingTopicId(topic.topicId);
    setEditValues({
      totalQuestions: topic.totalQuestions || 0,
      correctAnswers: topic.correctAnswers || 0,
      wrongAnswers: topic.wrongAnswers || 0,
    });
  };

  // Edit modunu iptal et
  const cancelEdit = () => {
    setEditingTopicId(null);
    setEditValues(null);
  };

  // Filter topics by selected evaluation category (İYİ / Geliştirilebilir / Tekrar)
  const evaluationTopics = stats?.evaluation?.topics ?? [];
  const filteredEvaluationTopics = evaluationFilter
    ? evaluationTopics.filter((t) => t.status === evaluationFilter)
    : evaluationTopics;

  // Group topics by section and subject
  const groupedTopics = filteredEvaluationTopics.length > 0
    ? filteredEvaluationTopics.reduce((acc, topic) => {
        const key = `${topic.sectionName}|${topic.subjectName}`;
        if (!acc[key]) {
          acc[key] = {
            sectionName: topic.sectionName,
            subjectName: topic.subjectName,
            topics: [] as Array<{
              topicId: string;
              topicName: string;
              sectionName: string;
              subjectName: string;
              totalQuestions: number;
              correctAnswers: number;
              wrongAnswers: number;
              status?: string | null;
            }>,
          };
        }
        acc[key].topics.push(topic);
        return acc;
      }, {} as Record<string, {
        sectionName: string;
        subjectName: string;
        topics: Array<{
          topicId: string;
          topicName: string;
          sectionName: string;
          subjectName: string;
          totalQuestions: number;
          correctAnswers: number;
          wrongAnswers: number;
          status?: string | null;
        }>;
      }>)
    : {};

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

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
              {user.role === 'ADMIN' && (
                <Link
                  href="/dashboard/super-admin"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  <span>Super Admin</span>
                </Link>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="font-medium">{user.name}</span>
                {planBadge && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${planBadge.bgClass} ${planBadge.textClass}`}
                    title={`${planBadge.label} planı`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${planBadge.dotClass}`} />
                    {planBadge.label}
                  </span>
                )}
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
            {[...Array(4)].map((_, _i) => (
              <div key={_i} className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 animate-pulse">
                <div className="h-3 w-20 bg-gray-200 rounded mb-3"></div>
                <div className="h-8 w-14 bg-gray-200 rounded mb-1.5"></div>
                <div className="h-2.5 w-28 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
            {/* Kart 1: Konu/Ders Tamamlanma Durumları */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-5 text-white hover:shadow-2xl transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-full bg-white/20 p-2.5 backdrop-blur-sm">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  İlerleme
                </span>
              </div>
              <div className="space-y-1.5 mb-2">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-xs">Toplam Ders</span>
                  <span className="text-lg font-bold">{stats?.totalSubjects || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-xs">Toplam Konu</span>
                  <span className="text-lg font-bold">{stats?.totalTopics || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-xs">Tamamlanan</span>
                  <span className="text-lg font-bold">{stats?.completedTopics || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-xs">Devam Eden</span>
                  <span className="text-lg font-bold">{stats?.inProgressTopics || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-xs">Başlanmamış</span>
                  <span className="text-lg font-bold">{stats?.notStartedTopics || 0}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-100">Tamamlanma Oranı</span>
                  <span className="text-lg font-bold">{completionRate}%</span>
                </div>
              </div>
            </div>

            {/* Kart 2: Çalışma Saati */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-5 text-white hover:shadow-2xl transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-full bg-white/20 p-2.5 backdrop-blur-sm">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  Çalışma
                </span>
              </div>
              <div className="mb-2">
                <p className="text-3xl font-bold mb-0.5">{studyHours}</p>
                <p className="text-purple-100 text-xs">Toplam Çalışma Saati</p>
              </div>
              {stats?.user?.dailyStudyHours && (
                <div className="pt-2 border-t border-white/20 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-100">Günlük Hedef</span>
                    <span className="text-sm font-bold">{stats.user.dailyStudyHours} saat/gün</span>
                  </div>
                </div>
              )}
              {/* Haftalık: günlük hedefe ulaşma — sabit sıra: Pzt, Sal, Çar, Per, Cum, Cmt, Paz */}
              {stats?.study && (
                <div className="pt-2 border-t border-white/20">
                  <p className="text-[10px] text-purple-100 mb-1">Bu hafta hedefe ulaşma</p>
                  <div className="grid grid-cols-7 gap-0.5 min-w-0">
                    {(['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'] as const).map((label) => {
                      const day = stats?.study?.weeklySummary?.find((d) => d.dayName === label);
                      const goalHours = day ? day.goalMinutes / 60 : 0;
                      const met = day?.completed ?? false;
                      const hoursStudied = day?.hoursStudied ?? 0;
                      return (
                        <div
                          key={label}
                          className={`flex flex-col items-center justify-center py-0.5 rounded min-w-0 ${
                            met ? 'bg-white/25' : 'bg-white/10'
                          }`}
                          title={day ? `${label}: ${hoursStudied} / ${goalHours} saat${met ? ' ✓' : ''}` : label}
                        >
                          <span className="text-[8px] font-semibold text-purple-100 leading-tight truncate max-w-full">{label}</span>
                          {met ? (
                            <CheckCircle className="h-2.5 w-2.5 text-white mt-0.5 shrink-0" />
                          ) : (
                            <Circle className="h-2.5 w-2.5 text-white/50 mt-0.5 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Kart: Deneme Takibi özet */}
            <Link
              href="/dashboard/deneme"
              className="block bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl p-5 text-white hover:shadow-2xl transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-full bg-white/20 p-2.5 backdrop-blur-sm">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  Deneme Takibi
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-100 mb-1">Deneme Takibi</p>
                {stats?.deneme && stats.deneme.totalAttempts > 0 ? (
                  <div className="space-y-1 text-xs text-amber-100/95">
                    <p className="font-medium text-white">{stats.deneme.totalAttempts} deneme</p>
                    {stats.deneme.lastAttemptAt && (
                      <>
                        <p>Son: {new Date(stats.deneme.lastAttemptAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        {stats.deneme.lastAttemptExamName && (
                          <p className="truncate" title={stats.deneme.lastAttemptExamName}>{stats.deneme.lastAttemptExamName}</p>
                        )}
                        {stats.deneme.lastAttemptScore != null && (
                          <p className="font-semibold text-white">{stats.deneme.lastAttemptScore} puan</p>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-amber-100/90">Henüz deneme kaydı yok.</p>
                )}
              </div>
            </Link>

            {/* Kart 3: Aktif Sınav ve Hedef Puan */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-5 text-white hover:shadow-2xl transition-all hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-3">
                <div className="rounded-full bg-white/20 p-2.5 backdrop-blur-sm">
                  <Target className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  Hedef
                </span>
              </div>
              <div>
                {stats?.activeExam ? (
                  <>
                    <p className="text-xs font-semibold text-green-100 mb-0.5">Aktif Sınav</p>
                    <p className="text-lg font-bold mb-2 truncate" title={stats.activeExam.name}>{stats.activeExam.name}</p>
                  </>
                ) : (
                  <p className="text-sm text-green-100 mb-2">Aktif sınav bulunamadı</p>
                )}
                {stats?.user?.targetScore && (
                  <div className="pt-2 border-t border-white/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-100">Hedef Puan</span>
                      <span className="text-xl font-bold">{stats.user.targetScore}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Evaluation Summary Card */}
        {stats?.evaluation && (
          <div className="mb-10 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-xl p-8 border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Target className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Hedef Puan Değerlendirmesi</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Hedef: {stats.evaluation.targetScore}/100 | 
                    Gerekli Net: {stats.evaluation.requiredNet.toFixed(1)} | 
                    Gerekli Başarı: {(stats.evaluation.requiredSuccessRate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <button
                type="button"
                onClick={() => setEvaluationFilter((prev) => (prev === 'GOOD' ? null : 'GOOD'))}
                className={`text-left rounded-xl p-5 border shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 ${
                  evaluationFilter === 'GOOD'
                    ? 'bg-green-50 border-green-400 ring-2 ring-green-300'
                    : 'bg-white border-green-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">İYİ</span>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {stats.evaluation.goodTopics}
                </div>
                <div className="text-xs text-gray-500">
                  {stats.evaluation.totalTopics > 0 
                    ? Math.round((stats.evaluation.goodTopics / stats.evaluation.totalTopics) * 100) 
                    : 0}% konu
                </div>
                {evaluationFilter === 'GOOD' && (
                  <div className="text-xs text-green-600 mt-2 font-medium">Tıklayarak listele</div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setEvaluationFilter((prev) => (prev === 'IMPROVABLE' ? null : 'IMPROVABLE'))}
                className={`text-left rounded-xl p-5 border shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 ${
                  evaluationFilter === 'IMPROVABLE'
                    ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-300'
                    : 'bg-white border-yellow-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-semibold text-gray-700">GELİŞTİRİLEBİLİR</span>
                </div>
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {stats.evaluation.improvableTopics}
                </div>
                <div className="text-xs text-gray-500">
                  {stats.evaluation.totalTopics > 0 
                    ? Math.round((stats.evaluation.improvableTopics / stats.evaluation.totalTopics) * 100) 
                    : 0}% konu
                </div>
                {evaluationFilter === 'IMPROVABLE' && (
                  <div className="text-xs text-yellow-700 mt-2 font-medium">Tıklayarak listele</div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setEvaluationFilter((prev) => (prev === 'REPEAT' ? null : 'REPEAT'))}
                className={`text-left rounded-xl p-5 border shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 ${
                  evaluationFilter === 'REPEAT'
                    ? 'bg-red-50 border-red-400 ring-2 ring-red-300'
                    : 'bg-white border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-semibold text-gray-700">TEKRAR</span>
                </div>
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {stats.evaluation.repeatTopics}
                </div>
                <div className="text-xs text-gray-500">
                  {stats.evaluation.totalTopics > 0 
                    ? Math.round((stats.evaluation.repeatTopics / stats.evaluation.totalTopics) * 100) 
                    : 0}% konu
                </div>
                {evaluationFilter === 'REPEAT' && (
                  <div className="text-xs text-red-600 mt-2 font-medium">Tıklayarak listele</div>
                )}
              </button>

              <div className="bg-white rounded-xl p-5 border border-blue-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">ORTALAMA</span>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {(stats.evaluation.averageSuccessRate * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  Net: {stats.evaluation.averageNet.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="bg-white/60 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>İYİ: Başarı oranı hedefin ≥%95&apos;i</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>GELİŞTİRİLEBİLİR: Başarı oranı hedefin ≥%80&apos;i</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>TEKRAR: Başarı oranı hedefin &lt;%80&apos;i</span>
                </div>
              </div>
            </div>

            {/* Konu Bazında Soru İstatistikleri */}
            {stats.evaluation.topics && stats.evaluation.topics.length > 0 && (
              <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Konu Bazında Soru İstatistikleri</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {evaluationFilter
                          ? `${evaluationFilter === 'GOOD' ? 'İYİ' : evaluationFilter === 'IMPROVABLE' ? 'Geliştirilebilir' : 'Tekrar'} konular listeleniyor (${filteredEvaluationTopics.length} konu)`
                          : 'Her konu için çözülen soru sayılarını girebilirsiniz'}
                      </p>
                    </div>
                    {evaluationFilter && (
                      <button
                        type="button"
                        onClick={() => setEvaluationFilter(null)}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 underline focus:outline-none"
                      >
                        Filtreyi kaldır
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {evaluationFilter && filteredEvaluationTopics.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      Bu kategoride konu bulunmuyor.
                    </div>
                  ) : (
                  Object.entries(groupedTopics).map(([key, group]) => (
                    <div key={key} className="border-b border-gray-200 last:border-b-0">
                      <button
                        onClick={() => toggleSection(key)}
                        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
                      >
                        <div>
                          <span className="font-semibold text-gray-900">{group.sectionName}</span>
                          <span className="text-gray-600 mx-2">/</span>
                          <span className="text-gray-700">{group.subjectName}</span>
                          <span className="ml-2 text-xs text-gray-500">({group.topics.length} konu)</span>
                        </div>
                        {expandedSections.has(key) ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      {expandedSections.has(key) && (
                        <div className="p-4 space-y-3">
                          {group.topics.map((topic) => (
                            <div key={topic.topicId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">{topic.topicName}</div>
                              </div>
                              {editingTopicId === topic.topicId && editValues ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-600">Toplam:</label>
                                    <input
                                      type="number"
                                      min="0"
                                      value={editValues.totalQuestions}
                                      onChange={(e) => setEditValues({
                                        ...editValues,
                                        totalQuestions: parseInt(e.target.value) || 0,
                                      })}
                                      className="w-16 px-2 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-green-600">Doğru:</label>
                                    <input
                                      type="number"
                                      min="0"
                                      max={editValues.totalQuestions}
                                      value={editValues.correctAnswers}
                                      onChange={(e) => setEditValues({
                                        ...editValues,
                                        correctAnswers: parseInt(e.target.value) || 0,
                                      })}
                                      className="w-16 px-2 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-green-600"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-red-600">Yanlış:</label>
                                    <input
                                      type="number"
                                      min="0"
                                      max={editValues.totalQuestions - editValues.correctAnswers}
                                      value={editValues.wrongAnswers}
                                      onChange={(e) => setEditValues({
                                        ...editValues,
                                        wrongAnswers: parseInt(e.target.value) || 0,
                                      })}
                                      className="w-16 px-2 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-red-600"
                                    />
                                  </div>
                                  <button
                                    onClick={() => updateQuestionStats(topic.topicId)}
                                    className="p-1.5 hover:bg-green-100 rounded transition-colors text-green-600"
                                    title="Kaydet"
                                  >
                                    <Save className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="p-1.5 hover:bg-red-100 rounded transition-colors text-red-600"
                                    title="İptal"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <div className="text-sm text-gray-600">
                                    Toplam: <span className="font-semibold">{topic.totalQuestions || '-'}</span>
                                  </div>
                                  <div className="text-sm text-green-600">
                                    Doğru: <span className="font-semibold">{topic.correctAnswers || '-'}</span>
                                  </div>
                                  <div className="text-sm text-red-600">
                                    Yanlış: <span className="font-semibold">{topic.wrongAnswers || '-'}</span>
                                  </div>
                                  <button
                                    onClick={() => startEdit(topic)}
                                    className="p-1.5 hover:bg-blue-100 rounded transition-colors text-blue-600"
                                    title="Düzenle"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hızlı erişim butonları */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {/* Detay Görüntüle */}
          <Link
            href="/dashboard/detail"
            className="group bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all flex items-center justify-center gap-3"
          >
            <BarChart3 className="h-5 w-5 text-blue-600 group-hover:text-blue-700 transition-colors" />
            <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Detay Görüntüle</span>
          </Link>

          {/* Deneme Takibi */}
          <Link
            href="/dashboard/deneme"
            className="group bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg hover:border-amber-300 transition-all flex items-center justify-center gap-3"
          >
            <BarChart3 className="h-5 w-5 text-amber-600 group-hover:text-amber-700 transition-colors" />
            <span className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">Deneme Takibi</span>
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