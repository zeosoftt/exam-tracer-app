/**
 * Dashboard Content Component
 * 3 kartlı modern dashboard tasarımı
 */

'use client';

import { useState, useEffect, useRef } from 'react';
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
  ClipboardList,
  TrendingUp,
  RefreshCw,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Circle,
  Shield,
  Brain,
  LayoutDashboard,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';

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
    startDate: string | null;
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
    recentAttempts: Array<{
      attemptedAt: string;
      totalScore: number | null;
      netScore: number | null;
    }>;
  };
  spacedRepetition?: {
    summary: { overdue: number; dueWithinWeek: number; totalScheduled: number };
    scheduleExplanation: string;
    items: Array<{
      topicId: string;
      topicName: string;
      subjectName: string;
      sectionName: string;
      nextReviewAt: string;
      overdue: boolean;
      daysUntil: number;
      level: number;
    }>;
  } | null;
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
  const [reviewAckTopicId, setReviewAckTopicId] = useState<string | null>(null);
  const [statsRefreshing, setStatsRefreshing] = useState(false);
  const [statsUpdatedAt, setStatsUpdatedAt] = useState<Date | null>(null);
  const lastLiteStatsFetchAtRef = useRef(0);
  const lastFullStatsFetchAtRef = useRef(0);
  const statsFetchInFlightRef = useRef(false);

  const fetchStats = async (options?: { manual?: boolean; force?: boolean; lite?: boolean }) => {
    const lite = options?.lite ?? true;
    const now = Date.now();
    const lastFetchAt = lite ? lastLiteStatsFetchAtRef.current : lastFullStatsFetchAtRef.current;
    if (!options?.force && !options?.manual && now - lastFetchAt < 10000) {
      return;
    }
    if (statsFetchInFlightRef.current) return;
    statsFetchInFlightRef.current = true;
    if (options?.manual) setStatsRefreshing(true);
    try {
      const params = new URLSearchParams();
      params.set('scope', lite ? 'core' : 'full');
      if (options?.force || options?.manual) params.set('fresh', '1');
      const url = params.size > 0 ? `/api/dashboard/stats?${params.toString()}` : '/api/dashboard/stats';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setStats((prev) => {
          if (lite && prev?.evaluation && !data.data?.evaluation) {
            return { ...data.data, evaluation: prev.evaluation };
          }
          return data.data;
        });
        setStatsUpdatedAt(new Date());
        if (lite) {
          lastLiteStatsFetchAtRef.current = Date.now();
        } else {
          lastFullStatsFetchAtRef.current = Date.now();
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      statsFetchInFlightRef.current = false;
      setIsLoading(false);
      if (options?.manual) setStatsRefreshing(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchStats({ lite: true });
      void fetchStats({ force: true, lite: false });
    };
    void load();
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
            bgClass: 'bg-stone-100 dark:bg-stone-800',
            textClass: 'text-stone-700 dark:text-stone-200',
            dotClass: 'bg-stone-400 dark:bg-stone-500',
          };
        } else if (code === 'PRO') {
          badge = {
            code,
            label: 'Pro',
            bgClass: 'bg-accent-100 dark:bg-accent-950/50',
            textClass: 'text-accent-800 dark:text-accent-200',
            dotClass: 'bg-accent-500',
          };
        } else if (code === 'ENTERPRISE') {
          badge = {
            code,
            label: 'Enterprise',
            bgClass: 'bg-violet-100 dark:bg-violet-950/50',
            textClass: 'text-violet-800 dark:text-violet-200',
            dotClass: 'bg-violet-500',
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
      fetchStats({ lite: true });
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStats({ lite: true });
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
        await fetchStats({ force: true, lite: false });
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

  const todayLabel = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const firstName = user.name.split(' ')[0] ?? user.name;
  const srsOverdue = stats?.spacedRepetition?.summary.overdue ?? 0;
  const srsDueWeek = stats?.spacedRepetition?.summary.dueWithinWeek ?? 0;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      {/* Header — sabit, tahmin edilebilir; eğitim SaaS’ta bilişsel yükü düşük tutar */}
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-2 sm:h-16">
            <Link href="/dashboard" className="group flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white sm:h-10 sm:w-10">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="font-display truncate text-lg font-bold sm:text-xl">The Goal Lab</span>
            </Link>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {user.role === 'ADMIN' && (
                <Link
                  href="/dashboard/super-admin"
                  className="hidden items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-2 text-xs font-medium text-primary-800 hover:bg-primary-100 dark:bg-primary-950/50 dark:text-primary-300 dark:hover:bg-primary-950 sm:flex sm:text-sm"
                >
                  <Shield className="h-4 w-4" />
                  Super Admin
                </Link>
              )}
              <ThemeToggleCompact />
              <button
                type="button"
                onClick={async () => {
                  await fetchStats({ manual: true, force: true, lite: true });
                  void fetchStats({ force: true, lite: false });
                }}
                disabled={statsRefreshing || isLoading}
                className="btn btn-secondary !px-2.5 !py-2 sm:!px-3"
                title="Verileri yenile"
                aria-label="Dashboard verilerini yenile"
              >
                <RefreshCw
                  className={cn('h-4 w-4 text-stone-600 dark:text-stone-400', statsRefreshing && 'animate-spin')}
                />
              </button>
              <div className="hidden items-center gap-2 text-xs text-stone-600 dark:text-stone-400 sm:flex sm:text-sm">
                <User className="h-4 w-4 shrink-0" />
                <span className="max-w-[140px] truncate font-medium lg:max-w-none">{user.name}</span>
                {planBadge && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                      planBadge.bgClass,
                      planBadge.textClass,
                    )}
                    title={`${planBadge.label} planı`}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', planBadge.dotClass)} />
                    {planBadge.label}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="btn btn-secondary !px-2.5 !py-2 text-xs sm:!px-4 sm:text-sm"
              >
                <LogOut className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {user.role === 'ADMIN' && (
        <div className="border-b border-primary-200 bg-primary-50 dark:border-primary-900 dark:bg-primary-950/40 sm:hidden">
          <Link
            href="/dashboard/super-admin"
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-primary-800 dark:text-primary-300"
          >
            <Shield className="h-4 w-4" />
            Super Admin
          </Link>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 sm:py-10 sm:pb-12 lg:px-8">
        {/* Odak: tek bakışta “ne yapmalıyım?” — F-deseni, sol üstten okuma */}
        <section
          className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900/80 sm:mb-10 sm:p-8"
          aria-labelledby="dashboard-hero-title"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-stone-500 dark:text-stone-400">{todayLabel}</p>
              <h1 id="dashboard-hero-title" className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Merhaba, {firstName}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                Önce bugünkü rutininizi seçin: konu çalışması, tekrar veya deneme. Sayılar aşağıda; detay için
                ilgili sayfaya geçin.
              </p>
              {statsUpdatedAt && !isLoading && (
                <p className="mt-3 text-xs text-stone-400 dark:text-stone-500">
                  Son güncelleme:{' '}
                  {statsUpdatedAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
            <nav
              className="flex flex-col gap-2 sm:min-w-[240px]"
              aria-label="Hızlı işlemler"
            >
              {srsOverdue > 0 && (
                <a
                  href="#srs-section"
                  className="btn btn-primary justify-center text-sm !py-3"
                >
                  {srsOverdue} tekrar gecikmiş — listeye git
                </a>
              )}
              <div className="flex flex-wrap gap-2">
                <Link href="/dashboard/detail" className="btn btn-secondary flex-1 justify-center text-sm !py-2.5 min-w-[6rem]">
                  Konular
                </Link>
                <Link href="/dashboard/pomodoro" className="btn btn-secondary flex-1 justify-center text-sm !py-2.5 min-w-[6rem]">
                  Pomodoro
                </Link>
                <Link href="/dashboard/deneme" className="btn btn-secondary flex-1 justify-center text-sm !py-2.5 min-w-[6rem]">
                  Deneme
                </Link>
              </div>
              {!isLoading && stats && (srsDueWeek > 0 || srsOverdue > 0) && (
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {srsDueWeek > 0 && <span>Bu hafta {srsDueWeek} tekrar yaklaşıyor. </span>}
                  Gecikenleri yukarıdaki düğme ile açabilirsiniz.
                </p>
              )}
            </nav>
          </div>
          {!isLoading && stats?.activeExam && (
            <p className="mt-6 border-t border-stone-100 pt-4 text-sm dark:border-stone-800">
              <span className="text-stone-500 dark:text-stone-400">Aktif sınav:</span>{' '}
              <span className="font-semibold text-stone-900 dark:text-stone-100">{stats.activeExam.name}</span>
              {typeof stats.completedTopics === 'number' && (
                <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">
                  {stats.completedTopics} konu tamamlandı
                  {typeof stats.totalPomodoroSessions === 'number' && stats.totalPomodoroSessions > 0 && (
                    <> · {stats.totalPomodoroSessions} pomodoro seansı</>
                  )}
                </span>
              )}
            </p>
          )}
          {!isLoading && !stats?.activeExam && (
            <p className="mt-6 border-t border-dashed border-stone-200 pt-4 text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
              Ayarlardan bir sınav seçerek ilerleme ve konu listesini bağlayabilirsiniz.
            </p>
          )}
        </section>

        <div className="mb-4 flex items-center gap-3 sm:mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800">
            <LayoutDashboard className="h-5 w-5 text-stone-600 dark:text-stone-300" aria-hidden />
          </div>
          <div>
            <h2 className="font-display text-base font-bold sm:text-lg">Özet sayılar</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 sm:text-sm">
              Tarama için büyük rakamlar; ayrıntı ilgili sayfada
            </p>
          </div>
        </div>

        {/* Kartlar */}
        {isLoading ? (
          <div className="mb-8 grid gap-4 sm:mb-10 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, _i) => (
              <div
                key={_i}
                className="animate-pulse rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/60"
              >
                <div className="mb-4 flex gap-3">
                  <div className="h-10 w-10 rounded-lg bg-stone-200 dark:bg-stone-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 rounded bg-stone-100 dark:bg-stone-800" />
                    <div className="h-8 w-16 rounded bg-stone-200 dark:bg-stone-700" />
                  </div>
                </div>
                <div className="h-3 w-full max-w-[90%] rounded bg-stone-100 dark:bg-stone-800" />
              </div>
            ))}
          </div>
        ) : (
          <>
          <div className="mb-8 grid gap-4 sm:mb-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-stone-200 border-l-4 border-l-primary-500 bg-white p-5 dark:border-stone-800 dark:border-l-primary-500 dark:bg-stone-900/80">
              <div className="mb-4 flex items-center gap-3 border-b border-stone-100 pb-3 dark:border-stone-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400">
                  <CheckCircle className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Konu ilerlemesi</p>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Özet</p>
                </div>
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-stone-500 dark:text-stone-400">Ders</dt>
                  <dd className="tabular-nums font-semibold text-stone-900 dark:text-stone-100">{stats?.totalSubjects ?? 0}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-stone-500 dark:text-stone-400">Konu</dt>
                  <dd className="tabular-nums font-semibold text-stone-900 dark:text-stone-100">{stats?.totalTopics ?? 0}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-stone-500 dark:text-stone-400">Tamam</dt>
                  <dd className="tabular-nums font-semibold text-stone-900 dark:text-stone-100">{stats?.completedTopics ?? 0}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-stone-500 dark:text-stone-400">Devam / Bekleyen</dt>
                  <dd className="tabular-nums font-medium text-stone-700 dark:text-stone-300">
                    {(stats?.inProgressTopics ?? 0) + (stats?.notStartedTopics ?? 0)}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 dark:border-stone-800">
                <span className="text-xs text-stone-500 dark:text-stone-400">Tamamlanma</span>
                <span className="text-lg font-bold tabular-nums text-primary-700 dark:text-primary-400">{completionRate}%</span>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 border-l-4 border-l-violet-500 bg-white p-5 dark:border-stone-800 dark:border-l-violet-500 dark:bg-stone-900/80">
              <div className="mb-3 flex items-center gap-3 border-b border-stone-100 pb-3 dark:border-stone-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  <Clock className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Çalışma süresi</p>
                  <p className="text-2xl font-bold tabular-nums text-stone-900 dark:text-stone-50">{studyHours}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">toplam saat</p>
                </div>
              </div>
              {stats?.user?.dailyStudyHours != null && (
                <p className="mb-3 text-sm text-stone-600 dark:text-stone-400">
                  Günlük hedef: <span className="font-semibold text-stone-900 dark:text-stone-100">{stats.user.dailyStudyHours}</span> saat/gün
                </p>
              )}
              {stats?.study && (
                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">Bu hafta</p>
                  <div className="grid grid-cols-7 gap-0.5">
                    {(['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'] as const).map((label) => {
                      const day = stats?.study?.weeklySummary?.find((d) => d.dayName === label);
                      const goalHours = day ? day.goalMinutes / 60 : 0;
                      const met = day?.completed ?? false;
                      const hoursStudied = day?.hoursStudied ?? 0;
                      return (
                        <div
                          key={label}
                          className={cn(
                            'flex flex-col items-center rounded py-1',
                            met
                              ? 'bg-primary-100 dark:bg-primary-950/60'
                              : 'bg-stone-100 dark:bg-stone-800/80',
                          )}
                          title={day ? `${label}: ${hoursStudied} / ${goalHours} saat${met ? ' ✓' : ''}` : label}
                        >
                          <span className="text-[8px] font-semibold text-stone-600 dark:text-stone-400">{label}</span>
                          {met ? (
                            <CheckCircle className="mt-0.5 h-2.5 w-2.5 text-primary-600 dark:text-primary-400" />
                          ) : (
                            <Circle className="mt-0.5 h-2.5 w-2.5 text-stone-300 dark:text-stone-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/dashboard/deneme"
              className="block rounded-2xl border border-stone-200 border-l-4 border-l-accent-500 bg-white p-5 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:border-l-accent-500 dark:bg-stone-900/80 dark:hover:bg-stone-900"
            >
              <div className="mb-3 flex items-center gap-3 border-b border-stone-100 pb-3 dark:border-stone-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300">
                  <ClipboardList className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Deneme takibi</p>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Kayıtlar ve net</p>
                </div>
              </div>
              {stats?.deneme && stats.deneme.totalAttempts > 0 ? (
                <>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    <span className="font-semibold text-stone-900 dark:text-stone-100">{stats.deneme.totalAttempts}</span> deneme
                  </p>
                  {stats.deneme.lastAttemptAt && (
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      Son:{' '}
                      {new Date(stats.deneme.lastAttemptAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                  {stats.deneme.recentAttempts && stats.deneme.recentAttempts.length > 0 && (() => {
                    const slice = [...stats.deneme.recentAttempts].reverse().slice(0, 8);
                    const nets = slice.map((a) => a.netScore ?? 0);
                    const minNet = Math.min(...nets);
                    const maxNet = Math.max(...nets);
                    const range = maxNet - minNet || 1;
                    return (
                      <div className="mt-3 flex h-10 items-end gap-0.5" aria-hidden>
                        {slice.map((a, i) => {
                          const net = a.netScore ?? 0;
                          const h = Math.max(8, ((net - minNet) / range) * 100);
                          return (
                            <div
                              key={`${a.attemptedAt}-${i}`}
                              className="min-w-0 flex-1 rounded-t bg-accent-500/40 dark:bg-accent-500/30"
                              style={{ height: `${Math.min(100, h)}%` }}
                              title={`${new Date(a.attemptedAt).toLocaleDateString('tr-TR')}: ${net} net`}
                            />
                          );
                        })}
                      </div>
                    );
                  })()}
                  <p className="mt-3 text-xs font-medium text-primary-600 dark:text-primary-400">Detaya git →</p>
                </>
              ) : (
                <p className="text-sm text-stone-500 dark:text-stone-400">Henüz deneme yok — eklemek için tıklayın</p>
              )}
            </Link>

            <div className="rounded-2xl border border-stone-200 border-l-4 border-l-teal-600 bg-white p-5 dark:border-stone-800 dark:border-l-teal-500 dark:bg-stone-900/80">
              <div className="mb-3 flex items-center gap-3 border-b border-stone-100 pb-3 dark:border-stone-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  <Target className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Sınav ve hedef</p>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Takvim</p>
                </div>
              </div>
              {stats?.activeExam ? (
                <>
                  <p className="line-clamp-2 text-sm font-medium text-stone-900 dark:text-stone-100" title={stats.activeExam.name}>
                    {stats.activeExam.name}
                  </p>
                  {stats.activeExam.startDate ? (() => {
                    const examDate = new Date(stats.activeExam.startDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    examDate.setHours(0, 0, 0, 0);
                    const diffMs = examDate.getTime() - today.getTime();
                    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                    if (daysLeft > 0) {
                      return (
                        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                          Sınava <span className="font-bold tabular-nums text-stone-900 dark:text-stone-100">{daysLeft}</span> gün
                        </p>
                      );
                    }
                    if (daysLeft === 0) {
                      return <p className="mt-2 text-sm font-semibold text-accent-700 dark:text-accent-400">Sınav bugün</p>;
                    }
                    return <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">Sınav tarihi geçti</p>;
                  })() : (
                    <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">Tarih atanmadı</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-stone-500 dark:text-stone-400">Aktif sınav yok</p>
              )}
              {stats?.user?.targetScore != null && (
                <div className="mt-4 border-t border-stone-100 pt-3 dark:border-stone-800">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-500 dark:text-stone-400">Hedef puan</span>
                    <span className="text-xl font-bold tabular-nums text-teal-700 dark:text-teal-400">{stats.user.targetScore}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {stats?.spacedRepetition && (
            <section
              id="srs-section"
              className="mb-8 scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/80 sm:mb-10 sm:p-7"
              aria-labelledby="srs-heading"
            >
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400">
                    <Brain className="h-6 w-6" aria-hidden />
                  </div>
                  <div>
                    <h2
                      id="srs-heading"
                      className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 sm:text-xl"
                    >
                      Aralıklı tekrar
                    </h2>
                    <p className="mt-1 max-w-prose text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                      {stats.spacedRepetition.scheduleExplanation}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:max-w-md sm:justify-end">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Geciken: {stats.spacedRepetition.summary.overdue}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-3 py-1.5 text-xs font-semibold text-accent-900 dark:border-accent-900/40 dark:bg-accent-950/40 dark:text-accent-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                    7 gün içinde: {stats.spacedRepetition.summary.dueWithinWeek}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                    Planlı: {stats.spacedRepetition.summary.totalScheduled}
                  </span>
                </div>
              </div>

              {stats.spacedRepetition.items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/80 px-4 py-8 text-center dark:border-stone-700 dark:bg-stone-950/40">
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    Tamamlanan konularınız oldukça burada sonraki tekrar tarihleri listelenir.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2 sm:space-y-3">
                  {stats.spacedRepetition.items.map((item) => (
                    <li
                      key={item.topicId}
                      className={cn(
                        'flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-950/50 sm:flex-row sm:items-center sm:justify-between',
                        item.overdue && 'border-l-4 border-l-red-500',
                        !item.overdue && item.daysUntil <= 1 && 'border-l-4 border-l-accent-500',
                        !item.overdue && item.daysUntil > 1 && 'border-l-4 border-l-primary-400 dark:border-l-primary-600',
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-stone-900 dark:text-stone-100">{item.topicName}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {item.sectionName} · {item.subjectName}
                        </p>
                        <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">
                          {item.overdue ? (
                            <span className="font-medium text-red-700 dark:text-red-400">Tekrar zamanı geldi veya geçti</span>
                          ) : item.daysUntil === 0 ? (
                            <span className="font-medium text-accent-800 dark:text-accent-400">Bugün tekrar önerilir</span>
                          ) : item.daysUntil === 1 ? (
                            <span>Yarın tekrar ({new Date(item.nextReviewAt).toLocaleDateString('tr-TR')})</span>
                          ) : (
                            <span>
                              ~{item.daysUntil} gün içinde tekrar (
                              {new Date(item.nextReviewAt).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'short',
                              })}
                              )
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-lg bg-stone-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                          Seviye {item.level}
                        </span>
                        <button
                          type="button"
                          disabled={reviewAckTopicId === item.topicId}
                          onClick={async () => {
                            setReviewAckTopicId(item.topicId);
                            try {
                              const res = await fetch(`/api/progress/${item.topicId}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ reviewCompleted: true }),
                              });
                              if (res.ok) await fetchStats({ force: true, lite: false });
                            } finally {
                              setReviewAckTopicId(null);
                            }
                          }}
                          className="btn btn-secondary text-xs !px-3 !py-2"
                        >
                          {reviewAckTopicId === item.topicId ? 'Kaydediliyor…' : 'Tekrar ettim'}
                        </button>
                        <Link href="/dashboard/detail" className="btn btn-primary text-xs !px-3 !py-2">
                          Konular
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
          </>
        )}

        {/* Evaluation Summary Card */}
        {stats?.evaluation && (
          <section className="card-edu mb-8 border-stone-200/80 p-6 sm:mb-10 sm:p-8">
            <div className="mb-6 flex flex-wrap items-start gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 p-3.5 text-white shadow-md shadow-primary-500/20">
                <Target className="h-7 w-7" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 sm:text-2xl">
                  Hedef puan değerlendirmesi
                </h2>
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-stone-600 dark:text-stone-400">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2 py-0.5 font-medium text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                    Hedef {stats.evaluation.targetScore}/100
                  </span>
                  <span>Gerekli net: {stats.evaluation.requiredNet.toFixed(1)}</span>
                  <span>Gerekli başarı: {(stats.evaluation.requiredSuccessRate * 100).toFixed(1)}%</span>
                </p>
              </div>
            </div>

            <div className="mb-6 grid gap-3 sm:gap-4 md:grid-cols-4">
              <button
                type="button"
                onClick={() => setEvaluationFilter((prev) => (prev === 'GOOD' ? null : 'GOOD'))}
                className={cn(
                  'rounded-2xl border p-5 text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-success-400 focus:ring-offset-2 dark:focus:ring-offset-stone-950',
                  evaluationFilter === 'GOOD'
                    ? 'border-success-400 bg-success-50 ring-2 ring-success-200 dark:bg-success-950/30 dark:ring-success-800'
                    : 'border-success-200/80 bg-white hover:border-success-300 dark:border-success-900/40 dark:bg-stone-950/50 dark:hover:border-success-700',
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success-600" />
                  <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">İyi</span>
                </div>
                <div className="mb-1 text-3xl font-bold text-success-600">
                  {stats.evaluation.goodTopics}
                </div>
                <div className="text-xs text-stone-500">
                  {stats.evaluation.totalTopics > 0
                    ? Math.round((stats.evaluation.goodTopics / stats.evaluation.totalTopics) * 100)
                    : 0}
                  % konu
                </div>
                {evaluationFilter === 'GOOD' && (
                  <div className="mt-2 text-xs font-medium text-success-700">Listeyi gösteriyorsunuz — tekrar tıklayınca kapanır</div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setEvaluationFilter((prev) => (prev === 'IMPROVABLE' ? null : 'IMPROVABLE'))}
                className={cn(
                  'rounded-2xl border p-5 text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 dark:focus:ring-offset-stone-950',
                  evaluationFilter === 'IMPROVABLE'
                    ? 'border-accent-400 bg-accent-50 ring-2 ring-accent-200 dark:bg-accent-950/30 dark:ring-accent-800'
                    : 'border-accent-200/80 bg-white hover:border-accent-300 dark:border-accent-900/40 dark:bg-stone-950/50 dark:hover:border-accent-700',
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent-600" />
                  <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">Geliştirilebilir</span>
                </div>
                <div className="mb-1 text-3xl font-bold text-accent-600">
                  {stats.evaluation.improvableTopics}
                </div>
                <div className="text-xs text-stone-500">
                  {stats.evaluation.totalTopics > 0
                    ? Math.round((stats.evaluation.improvableTopics / stats.evaluation.totalTopics) * 100)
                    : 0}
                  % konu
                </div>
                {evaluationFilter === 'IMPROVABLE' && (
                  <div className="mt-2 text-xs font-medium text-accent-800">Listeyi gösteriyorsunuz — tekrar tıklayınca kapanır</div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setEvaluationFilter((prev) => (prev === 'REPEAT' ? null : 'REPEAT'))}
                className={cn(
                  'rounded-2xl border p-5 text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-danger-400 focus:ring-offset-2 dark:focus:ring-offset-stone-950',
                  evaluationFilter === 'REPEAT'
                    ? 'border-danger-400 bg-danger-50 ring-2 ring-danger-200 dark:bg-danger-950/30 dark:ring-danger-800'
                    : 'border-danger-200/80 bg-white hover:border-danger-300 dark:border-danger-900/40 dark:bg-stone-950/50 dark:hover:border-danger-700',
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-danger-600" />
                  <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">Tekrar</span>
                </div>
                <div className="mb-1 text-3xl font-bold text-danger-600">
                  {stats.evaluation.repeatTopics}
                </div>
                <div className="text-xs text-stone-500">
                  {stats.evaluation.totalTopics > 0
                    ? Math.round((stats.evaluation.repeatTopics / stats.evaluation.totalTopics) * 100)
                    : 0}
                  % konu
                </div>
                {evaluationFilter === 'REPEAT' && (
                  <div className="mt-2 text-xs font-medium text-danger-700">Listeyi gösteriyorsunuz — tekrar tıklayınca kapanır</div>
                )}
              </button>

              <div className="rounded-2xl border border-primary-200/90 bg-gradient-to-br from-primary-50/80 to-white p-5 shadow-sm dark:border-primary-900/50 dark:from-primary-950/40 dark:to-stone-950/50">
                <div className="mb-2 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-semibold text-stone-800 dark:text-stone-100">Ortalama</span>
                </div>
                <div className="mb-1 text-2xl font-bold text-primary-600">
                  {(stats.evaluation.averageSuccessRate * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-stone-500">Net: {stats.evaluation.averageNet.toFixed(2)}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4 dark:border-stone-700 dark:bg-stone-950/50">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">Kategori açıklaması</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-success-500" />
                  <span>İyi: başarı ≥ hedefin %95&apos;i</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-500" />
                  <span>Geliştirilebilir: başarı ≥ hedefin %80&apos;i</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-danger-500" />
                  <span>Tekrar: başarı &lt; hedefin %80&apos;i</span>
                </div>
              </div>
            </div>

            {stats.evaluation.topics && stats.evaluation.topics.length > 0 && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950/50">
                <div className="border-b border-stone-200 bg-gradient-to-r from-stone-50 to-primary-50/40 p-4 dark:border-stone-800 dark:from-stone-900 dark:to-primary-950/20 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">Konu bazında soru istatistikleri</h3>
                      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                        {evaluationFilter
                          ? `${evaluationFilter === 'GOOD' ? 'İyi' : evaluationFilter === 'IMPROVABLE' ? 'Geliştirilebilir' : 'Tekrar'} konuları (${filteredEvaluationTopics.length} konu)`
                          : 'Konu satırından doğru / yanlış sayılarını güncelleyebilirsiniz'}
                      </p>
                    </div>
                    {evaluationFilter && (
                      <button
                        type="button"
                        onClick={() => setEvaluationFilter(null)}
                        className="rounded text-sm font-medium text-primary-700 underline decoration-primary-300 underline-offset-2 transition hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 dark:text-primary-400 dark:hover:text-primary-300 dark:focus:ring-offset-stone-950"
                      >
                        Filtreyi kaldır
                      </button>
                    )}
                  </div>
                </div>
                <div className="custom-scrollbar max-h-96 overflow-y-auto">
                  {evaluationFilter && filteredEvaluationTopics.length === 0 ? (
                    <div className="p-10 text-center text-sm text-stone-500 dark:text-stone-400">Bu kategoride konu bulunmuyor.</div>
                  ) : (
                    Object.entries(groupedTopics).map(([key, group]) => (
                      <div key={key} className="border-b border-stone-100 last:border-b-0 dark:border-stone-800">
                        <button
                          type="button"
                          onClick={() => toggleSection(key)}
                          className="flex w-full items-center justify-between bg-stone-50/80 px-4 py-3.5 text-left transition-colors hover:bg-stone-100/90 dark:bg-stone-900/60 dark:hover:bg-stone-900"
                        >
                          <div className="min-w-0">
                            <span className="font-semibold text-stone-900 dark:text-stone-100">{group.sectionName}</span>
                            <span className="mx-2 text-stone-400 dark:text-stone-500">/</span>
                            <span className="text-stone-700 dark:text-stone-300">{group.subjectName}</span>
                            <span className="ml-2 text-xs text-stone-500 dark:text-stone-400">({group.topics.length} konu)</span>
                          </div>
                          {expandedSections.has(key) ? (
                            <ChevronDown className="h-4 w-4 shrink-0 text-stone-400 dark:text-stone-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 text-stone-400 dark:text-stone-500" />
                          )}
                        </button>
                        {expandedSections.has(key) && (
                          <div className="space-y-2 p-3 sm:p-4">
                            {group.topics.map((topic) => (
                              <div
                                key={topic.topicId}
                                className="flex flex-col gap-3 rounded-xl border border-stone-100 bg-white p-3 transition-colors hover:border-primary-200 hover:bg-primary-50/20 dark:border-stone-800 dark:bg-stone-950/40 dark:hover:border-primary-900 dark:hover:bg-primary-950/20 sm:flex-row sm:items-center sm:gap-4"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-medium text-stone-900 dark:text-stone-100">{topic.topicName}</div>
                                </div>
                                {editingTopicId === topic.topicId && editValues ? (
                                  <>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <label className="text-xs text-stone-600">Toplam:</label>
                                      <input
                                        type="number"
                                        min="0"
                                        value={editValues.totalQuestions}
                                        onChange={(e) =>
                                          setEditValues({
                                            ...editValues,
                                            totalQuestions: parseInt(e.target.value) || 0,
                                          })
                                        }
                                        className="input !w-16 !px-2 !py-1.5 text-center text-xs"
                                      />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <label className="text-xs text-success-700">Doğru:</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max={editValues.totalQuestions}
                                        value={editValues.correctAnswers}
                                        onChange={(e) =>
                                          setEditValues({
                                            ...editValues,
                                            correctAnswers: parseInt(e.target.value) || 0,
                                          })
                                        }
                                        className="input !w-16 !px-2 !py-1.5 text-center text-xs text-success-700"
                                      />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <label className="text-xs text-danger-700">Yanlış:</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max={editValues.totalQuestions - editValues.correctAnswers}
                                        value={editValues.wrongAnswers}
                                        onChange={(e) =>
                                          setEditValues({
                                            ...editValues,
                                            wrongAnswers: parseInt(e.target.value) || 0,
                                          })
                                        }
                                        className="input !w-16 !px-2 !py-1.5 text-center text-xs text-danger-700"
                                      />
                                    </div>
                                    <div className="flex gap-1">
                                      <button
                                        type="button"
                                        onClick={() => updateQuestionStats(topic.topicId)}
                                        className="rounded-lg p-2 text-success-600 transition-colors hover:bg-success-50"
                                        title="Kaydet"
                                      >
                                        <Save className="h-4 w-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="rounded-lg p-2 text-danger-600 transition-colors hover:bg-danger-50"
                                        title="İptal"
                                      >
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex flex-wrap gap-3 text-sm">
                                      <span className="text-stone-600 dark:text-stone-400">
                                        Toplam:{' '}
                                        <span className="font-semibold text-stone-900 dark:text-stone-100">{topic.totalQuestions || '—'}</span>
                                      </span>
                                      <span className="text-success-700">
                                        Doğru:{' '}
                                        <span className="font-semibold">{topic.correctAnswers || '—'}</span>
                                      </span>
                                      <span className="text-danger-700">
                                        Yanlış:{' '}
                                        <span className="font-semibold">{topic.wrongAnswers || '—'}</span>
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => startEdit(topic)}
                                      className="rounded-lg p-2 text-primary-600 transition-colors hover:bg-primary-50 sm:ml-auto"
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
                    ))
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="mt-10 sm:mt-12" aria-labelledby="quick-links-heading">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 id="quick-links-heading" className="font-display text-base font-bold text-stone-900 dark:text-stone-100 sm:text-lg">
                Sayfalar
              </h2>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 sm:text-sm">
                Aynı düzeni ayarlarda da bulabilirsiniz; burada tek tıkla geçiş
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
            <Link
              href="/dashboard/detail"
              className="group relative flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-soft transition-colors duration-200 hover:border-primary-300 dark:border-stone-800 dark:bg-stone-900/80 dark:hover:border-primary-700 sm:min-h-[7.5rem] sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                  <BarChart3 className="h-5 w-5" aria-hidden />
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary-600 dark:text-stone-600 dark:group-hover:text-primary-400" />
              </div>
              <span className="font-display font-semibold text-stone-900 group-hover:text-primary-700 dark:text-stone-100 dark:group-hover:text-primary-400">Konu detayı</span>
              <span className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">Ders ve konu ilerlemesini güncelleyin</span>
            </Link>
            <Link
              href="/dashboard/deneme"
              className="group relative flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-soft transition-colors duration-200 hover:border-accent-300 dark:border-stone-800 dark:bg-stone-900/80 dark:hover:border-accent-700 sm:min-h-[7.5rem] sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 text-accent-700 transition-colors group-hover:bg-accent-500 group-hover:text-white">
                  <ClipboardList className="h-5 w-5" aria-hidden />
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-600 dark:text-stone-600 dark:group-hover:text-accent-400" />
              </div>
              <span className="font-display font-semibold text-stone-900 group-hover:text-accent-700 dark:text-stone-100 dark:group-hover:text-accent-400">Deneme takibi</span>
              <span className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">Deneme kayıtları ve net trendi</span>
            </Link>
            <Link
              href="/dashboard/pomodoro"
              className="group relative flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-soft transition-colors duration-200 hover:border-violet-300 dark:border-stone-800 dark:bg-stone-900/80 dark:hover:border-violet-700 sm:min-h-[7.5rem] sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                  <Timer className="h-5 w-5" aria-hidden />
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-600 dark:text-stone-600 dark:group-hover:text-violet-400" />
              </div>
              <span className="font-display font-semibold text-stone-900 group-hover:text-violet-700 dark:text-stone-100 dark:group-hover:text-violet-400">Pomodoro</span>
              <span className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">Odaklanma seansları ve istatistik</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="group relative flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-soft transition-colors duration-200 hover:border-stone-400 dark:border-stone-800 dark:bg-stone-900/80 dark:hover:border-stone-600 sm:min-h-[7.5rem] sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition-colors group-hover:bg-stone-800 group-hover:text-white">
                  <Settings className="h-5 w-5" aria-hidden />
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-stone-600 dark:text-stone-600 dark:group-hover:text-stone-400" />
              </div>
              <span className="font-display font-semibold text-stone-900 group-hover:text-stone-800 dark:text-stone-100 dark:group-hover:text-stone-200">Ayarlar</span>
              <span className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">Tema, hedef puan ve hesap</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}