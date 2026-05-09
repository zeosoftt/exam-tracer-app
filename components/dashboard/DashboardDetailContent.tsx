/**
 * Dashboard Detail Content Component
 * Tab yapısı ile bölüm ve ders ilerlemesi
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  BookOpen,
  CheckCircle,
  LogOut,
  User,
  ArrowLeft,
  FileText,
  Circle,
  PlayCircle,
  ChevronDown,
  TrendingUp,
  RefreshCw,
  Target,
  Edit2,
  Save,
  X,
  LifeBuoy,
} from 'lucide-react';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';

interface Section {
  id: string;
  code: string;
  name: string;
  order: number;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  reviewedTopics: number;
  progressPercentage: number;
  subjects: Subject[];
}

interface TopicEvaluation {
  topicNet: number;
  topicSuccessRate: number;
  requiredSuccessRate: number;
  requiredNet: number;
  status: 'GOOD' | 'IMPROVABLE' | 'REPEAT';
  isGood: boolean;
  isImprovable: boolean;
  needsRepeat: boolean;
}

interface Topic {
  id: string;
  code: string;
  name: string;
  order: number;
  examQuestionCount: number | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  evaluation: TopicEvaluation | null;
}

interface Subject {
  id: string;
  code: string;
  name: string;
  order: number;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  reviewedTopics: number;
  progressPercentage: number;
  topics: Topic[];
}

interface DetailData {
  exam: {
    id: string;
    name: string;
    code: string;
  } | null;
  sections: Section[];
  evaluation: {
    targetScore: number;
    totalExamQuestions: number;
    requiredNet: number | null;
    requiredSuccessRate: number | null;
  } | null;
}

export function DashboardDetailContent({
  user,
}: {
  user: { id: string; name: string; email: string; role?: string };
}) {
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTopicId, setUpdatingTopicId] = useState<string | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
  } | null>(null);
  const lastDetailFetchAtRef = useRef(0);
  const detailFetchInFlightRef = useRef(false);

  const fetchDetailData = useCallback(async (options?: { force?: boolean }) => {
    const now = Date.now();
    if (!options?.force && now - lastDetailFetchAtRef.current < 10000) return;
    if (detailFetchInFlightRef.current) return;

    detailFetchInFlightRef.current = true;
    try {
      const response = await fetch(options?.force ? '/api/dashboard/detail?fresh=1' : '/api/dashboard/detail');
      if (!response.ok) return;
      const data = await response.json();
      setDetailData(data.data);
      lastDetailFetchAtRef.current = Date.now();

      if (data.data?.sections?.length > 0 && !selectedSectionId) {
        const firstSection = data.data.sections[0];
        setSelectedSectionId(firstSection.id);
        if (firstSection.subjects?.length > 0) {
          setSelectedSubjectId(firstSection.subjects[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      detailFetchInFlightRef.current = false;
      setIsLoading(false);
    }
  }, [selectedSectionId]);

  useEffect(() => {
    fetchDetailData();
  }, [fetchDetailData]);

  const selectedSection = detailData?.sections.find((s) => s.id === selectedSectionId) || null;
  const selectedSubject = selectedSection?.subjects.find((s) => s.id === selectedSubjectId) || null;

  // Bölüm değiştiğinde ilk dersi seç
  useEffect(() => {
    if (selectedSection && selectedSection.subjects.length > 0) {
      const currentSubject = selectedSection.subjects.find((s) => s.id === selectedSubjectId);
      if (!currentSubject) {
        setSelectedSubjectId(selectedSection.subjects[0].id);
      }
    }
  }, [selectedSectionId, selectedSection, selectedSubjectId]);

  // Konu durumunu güncelle
  const updateTopicStatus = async (topicId: string, newStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => {
    setUpdatingTopicId(topicId);
    try {
      const response = await fetch(`/api/progress/${topicId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Verileri yeniden yükle
        await fetchDetailData({ force: true });
      } else {
        const error = await response.json();
        console.error('Failed to update topic status:', error);
        alert('Durum güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Error updating topic status:', error);
      alert('Durum güncellenirken bir hata oluştu');
    } finally {
      setUpdatingTopicId(null);
    }
  };

  // Soru sayılarını güncelle
  const updateQuestionStats = async (topicId: string) => {
    if (!editValues) return;

    setUpdatingTopicId(topicId);
    try {
      // Validasyon
      if (editValues.correctAnswers + editValues.wrongAnswers > editValues.totalQuestions) {
        alert('Doğru + Yanlış sayısı toplam soru sayısını geçemez!');
        setUpdatingTopicId(null);
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
        await fetchDetailData({ force: true });
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
    } finally {
      setUpdatingTopicId(null);
    }
  };

  // Edit modunu başlat
  const startEdit = (topic: Topic) => {
    setEditingTopicId(topic.id);
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

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-2 sm:h-16">
            <Link href="/dashboard" className="group flex min-w-0 items-center gap-1.5 sm:gap-2">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 opacity-75 blur transition group-hover:opacity-100" />
                <BookOpen className="relative h-5 w-5 text-primary-600 dark:text-primary-400 sm:h-6 sm:w-6" />
              </div>
              <span className="truncate text-base font-bold text-stone-900 dark:text-stone-100 sm:text-xl">
                The Goal Lab
              </span>
            </Link>
            <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
              <Link
                href="/destek"
                className="rounded-xl border border-stone-200 p-2 text-stone-600 transition-colors hover:bg-stone-50 hover:text-primary-600 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-primary-400"
                title="Destek ve iletişim"
                aria-label="Destek ve iletişim"
              >
                <LifeBuoy className="h-[18px] w-[18px]" aria-hidden />
              </Link>
              <ThemeToggleCompact />
              <div className="flex min-w-0 items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 sm:gap-2">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="max-w-[100px] truncate font-medium sm:max-w-none">{user.name}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 rounded-xl bg-stone-100 p-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 sm:px-4 sm:py-2"
                title="Çıkış"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="group mb-4 inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 sm:mb-8"
        >
          <div className="rounded-lg bg-stone-100 p-1.5 transition-colors group-hover:bg-stone-200 dark:bg-stone-800 dark:group-hover:bg-stone-700">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span className="sm:inline">Özet Ekrana Dön</span>
        </Link>

        {/* Bölüm Tabları */}
        {!isLoading && detailData?.sections && detailData.sections.length > 0 && (
          <div className="mb-4 sm:mb-8">
            <div className="overflow-hidden rounded-xl border border-stone-100 bg-white shadow-xl transition-shadow hover:shadow-2xl dark:border-stone-800 dark:bg-stone-900/90 sm:rounded-2xl">
              {/* Tab Headers */}
              <div className="-mx-1 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden border-b border-stone-200 bg-gradient-to-r from-stone-50 to-white scrollbar-thin dark:border-stone-800 dark:from-stone-900 dark:to-stone-950">
                {detailData.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSectionId(section.id)}
                    className={`relative flex-shrink-0 snap-start border-b-3 px-4 py-4 text-sm font-semibold transition-all sm:px-8 sm:py-5 ${
                      selectedSectionId === section.id
                        ? 'border-primary-600 bg-gradient-to-b from-primary-50 to-white text-primary-600 dark:border-primary-500 dark:from-primary-950/40 dark:to-stone-900 dark:text-primary-400'
                        : 'border-transparent text-stone-600 hover:bg-stone-50/50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/50 dark:hover:text-stone-100'
                    }`}
                  >
                    {selectedSectionId === section.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600"></div>
                    )}
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{section.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          selectedSectionId === section.id
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
                            : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                        }`}>
                          {section.totalTopics} konu
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${selectedSectionId === section.id ? 'bg-primary-500' : 'bg-stone-300 dark:bg-stone-600'}`}></div>
                        <span
                          className={`text-xs font-medium ${
                            selectedSectionId === section.id
                              ? 'text-primary-600 dark:text-primary-400'
                              : 'text-stone-500 dark:text-stone-400'
                          }`}
                        >
                          %{section.progressPercentage} tamamlandı
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Tab Content - Ders Tabları */}
              {selectedSection && (
                <div className="p-8">
                  {/* Bölüm İstatistikleri */}
                  <div className="mb-6 rounded-xl border border-primary-100 bg-gradient-to-br bg-primary-50 p-6 dark:border-primary-900/40 dark:bg-primary-950/25">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="mb-2 text-2xl font-bold text-stone-900 dark:text-stone-100">
                          {selectedSection.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="font-medium text-stone-600 dark:text-stone-400">
                              {selectedSection.completedTopics} Tamamlandı
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                            <span className="font-medium text-stone-600 dark:text-stone-400">
                              {selectedSection.inProgressTopics} Devam Ediyor
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-stone-400"></div>
                            <span className="font-medium text-stone-600 dark:text-stone-400">
                              {selectedSection.notStartedTopics} Başlanmadı
                            </span>
                          </div>
                          {selectedSection.reviewedTopics > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                              <span className="font-medium text-stone-600 dark:text-stone-400">
                                {selectedSection.reviewedTopics} Gözden Geçirildi
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-left sm:text-right">
                        <div className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl dark:from-primary-400 dark:to-primary-500">
                          %{selectedSection.progressPercentage}
                        </div>
                        <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Tamamlanma</p>
                        <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
                          {selectedSection.completedTopics + selectedSection.reviewedTopics} / {selectedSection.totalTopics} konu
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/60 dark:bg-stone-800/80">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${selectedSection.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Ders Tabları */}
                  <div className="-mx-1 mb-4 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden border-b-2 border-stone-200 px-1 scrollbar-thin dark:border-stone-700 sm:mb-6">
                    {selectedSection.subjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => setSelectedSubjectId(subject.id)}
                        className={`relative flex-shrink-0 snap-start rounded-t-lg border-b-3 px-3 py-3 text-sm font-semibold transition-all sm:px-5 ${
                          selectedSubjectId === subject.id
                            ? 'border-primary-600 bg-gradient-to-b from-primary-50 to-white text-primary-600 shadow-sm dark:border-primary-500 dark:from-primary-950/40 dark:to-stone-900 dark:text-primary-400'
                            : 'border-transparent text-stone-600 hover:bg-stone-50/50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/50 dark:hover:text-stone-100'
                        }`}
                      >
                        {selectedSubjectId === subject.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600"></div>
                        )}
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-2">
                            <span>{subject.name}</span>
                            <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                              selectedSubjectId === subject.id
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
                                : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                            }`}>
                              {subject.totalTopics} konu
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`h-1.5 w-1.5 rounded-full ${selectedSubjectId === subject.id ? 'bg-primary-500' : 'bg-stone-300 dark:bg-stone-600'}`}></div>
                            <span
                              className={`text-xs font-medium ${
                                selectedSubjectId === subject.id
                                  ? 'text-primary-600 dark:text-primary-400'
                                  : 'text-stone-500 dark:text-stone-400'
                              }`}
                            >
                              %{subject.progressPercentage} tamamlandı
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Ders İçerikleri - Alt kısım */}
                  {selectedSubject && (
                    <div className="min-h-[200px] rounded-xl border-2 border-stone-100 bg-gradient-to-br from-white to-stone-50 p-4 shadow-inner dark:border-stone-800 dark:from-stone-900 dark:to-stone-950 sm:min-h-[300px] sm:p-6 lg:p-8">
                      {/* Evaluation Info Card */}
                      {detailData?.evaluation && (
                        <div className="mb-4 rounded-xl border border-primary-200 bg-gradient-to-br bg-primary-50 p-4 shadow-sm dark:border-primary-900/40 dark:bg-primary-950/25 sm:mb-6 sm:p-5">
                          <div className="flex flex-col gap-4">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="flex-shrink-0 rounded-lg bg-white p-2 shadow-sm dark:bg-stone-800">
                                <Target className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-sm font-bold text-stone-900 dark:text-stone-100">Hedef Puan Temelli Değerlendirme</h5>
                                <p className="mt-0.5 break-words text-xs text-stone-600 dark:text-stone-400">
                                  Hedef: {detailData.evaluation.targetScore}/100 · Gerekli Net: {detailData.evaluation.requiredNet?.toFixed(1) || '-'} · Başarı: {detailData.evaluation.requiredSuccessRate ? (detailData.evaluation.requiredSuccessRate * 100).toFixed(1) : '-'}%
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                              <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-300">
                                <CheckCircle className="h-3 w-3 flex-shrink-0" />
                                İYİ ≥%95
                              </div>
                              <div className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-2 py-1.5 text-xs font-semibold text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300">
                                <TrendingUp className="h-3 w-3 flex-shrink-0" />
                                GELİŞTİRİLEBİLİR ≥%80
                              </div>
                              <div className="flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-1.5 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                <RefreshCw className="h-3 w-3 flex-shrink-0" />
                                TEKRAR &lt;%80
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="mb-4 sm:mb-6">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="mb-2 text-lg font-bold text-stone-900 dark:text-stone-100 sm:text-xl">
                              {selectedSubject.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <span className="font-medium text-stone-600 dark:text-stone-400">
                                  {selectedSubject.completedTopics} Tamamlandı
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                <span className="font-medium text-stone-600 dark:text-stone-400">
                                  {selectedSubject.inProgressTopics} Devam Ediyor
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full bg-stone-400"></div>
                                <span className="font-medium text-stone-600 dark:text-stone-400">
                                  {selectedSubject.notStartedTopics} Başlanmadı
                                </span>
                              </div>
                              {selectedSubject.reviewedTopics > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                                  <span className="font-medium text-stone-600 dark:text-stone-400">
                                    {selectedSubject.reviewedTopics} Gözden Geçirildi
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="w-fit rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 sm:ml-4">
                            <span className="text-lg font-bold text-white">%{selectedSubject.progressPercentage}</span>
                          </div>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200 shadow-inner dark:bg-stone-800">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-700 ease-out shadow-sm"
                            style={{ width: `${selectedSubject.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Konular Tablosu */}
                      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft dark:border-stone-800 dark:bg-stone-900/90">
                        {selectedSubject.topics && selectedSubject.topics.length > 0 && (
                          <div className="border-b border-stone-100 bg-stone-50/50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/50 sm:px-5">
                            <p className="text-sm text-stone-600 dark:text-stone-400">
                              <span className="font-semibold text-stone-900 dark:text-stone-100">{selectedSubject.topics.length}</span> konu
                              {selectedSubject.completedTopics > 0 && (
                                <> · <span className="font-medium text-primary-600 dark:text-primary-400">{selectedSubject.completedTopics} tamamlandı</span></>
                              )}
                            </p>
                          </div>
                        )}
                        <div className="overflow-auto max-h-[min(70vh,600px)]">
                          {selectedSubject.topics && selectedSubject.topics.length > 0 ? (
                          <table className="w-full min-w-[680px]">
                            <thead className="sticky top-0 z-10">
                              <tr className="border-b border-stone-200 bg-stone-50 shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:border-stone-700 dark:bg-stone-900/80">
                                <th className="w-[130px] px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 sm:w-[140px]">
                                  Durum
                                </th>
                                <th className="min-w-[160px] px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                                  Konu Adı
                                </th>
                                <th className="w-[90px] px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                                  Soru
                                </th>
                                <th className="w-[85px] px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                                  Çözülen
                                </th>
                                <th className="w-[70px] px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                                  Doğru
                                </th>
                                <th className="min-w-[100px] w-[100px] px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                                  Yanlış
                                </th>
                                {detailData?.evaluation && (
                                  <>
                                    <th className="w-[70px] px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                                      Net
                                    </th>
                                    <th className="w-[80px] px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                                      Başarı
                                    </th>
                                    <th className="sticky right-0 z-10 w-[120px] bg-stone-50 px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-stone-600 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)] dark:bg-stone-900/80 dark:text-stone-400">
                                      Değerlendirme
                                    </th>
                                  </>
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                              {selectedSubject.topics.map((topic) => {
                                const getStatusConfig = (status: string) => {
                                  switch (status) {
                                    case 'COMPLETED':
                                      return {
                                        icon: CheckCircle,
                                        color: 'text-green-700 dark:text-green-300',
                                        bgColor: 'bg-green-50 dark:bg-green-950/25',
                                        borderColor: 'border-green-200 dark:border-green-900/50',
                                        label: 'Tamamlandı',
                                        iconBg: 'bg-green-100 dark:bg-green-950/40',
                                        dotColor: 'bg-green-500',
                                        value: 'COMPLETED' as const,
                                      };
                                    case 'IN_PROGRESS':
                                      return {
                                        icon: PlayCircle,
                                        color: 'text-yellow-700 dark:text-yellow-300',
                                        bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
                                        borderColor: 'border-yellow-200 dark:border-yellow-900/50',
                                        label: 'Devam Ediyor',
                                        iconBg: 'bg-yellow-100 dark:bg-yellow-950/40',
                                        dotColor: 'bg-yellow-500',
                                        value: 'IN_PROGRESS' as const,
                                      };
                                    default:
                                      return {
                                        icon: Circle,
                                        color: 'text-stone-500 dark:text-stone-400',
                                        bgColor: 'bg-stone-50 dark:bg-stone-900/40',
                                        borderColor: 'border-stone-200 dark:border-stone-700',
                                        label: 'Başlanmadı',
                                        iconBg: 'bg-stone-100 dark:bg-stone-800',
                                        dotColor: 'bg-stone-400',
                                        value: 'NOT_STARTED' as const,
                                      };
                                  }
                                };

                                const statusConfig = getStatusConfig(topic.status);
                                const Icon = statusConfig.icon;

                                return (
                                  <tr
                                    key={topic.id}
                                    className={`${statusConfig.bgColor} hover:bg-opacity-90 transition-colors ${editingTopicId === topic.id ? 'ring-1 ring-primary-200 ring-inset' : ''}`}
                                  >
                                    <td className="px-4 py-3 whitespace-nowrap align-middle">
                                      <div className="relative z-20 inline-flex items-center">
                                        <select
                                          value={topic.status}
                                          onChange={(e) => updateTopicStatus(topic.id, e.target.value as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED')}
                                          disabled={updatingTopicId === topic.id}
                                          className={`appearance-none min-w-[120px] cursor-pointer rounded-xl border px-3 py-2 pr-8 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:z-30 ${
                                            statusConfig.iconBg
                                          } ${statusConfig.color} ${statusConfig.borderColor} ${
                                            updatingTopicId === topic.id ? 'opacity-50 cursor-not-allowed' : ''
                                          }`}
                                        >
                                          <option className="bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100" value="NOT_STARTED">Başlanmadı</option>
                                          <option className="bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100" value="IN_PROGRESS">Devam Ediyor</option>
                                          <option className="bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100" value="COMPLETED">Tamamlandı</option>
                                        </select>
                                        <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 ${statusConfig.color} pointer-events-none`} />
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 min-w-0">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className={`p-2 rounded-xl flex-shrink-0 ${statusConfig.iconBg}`}>
                                          <Icon className={`h-4 w-4 ${statusConfig.color}`} />
                                        </div>
                                        <span className="truncate text-sm font-medium text-stone-900 dark:text-stone-100" title={topic.name}>
                                          {topic.name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-3 py-3 text-center align-middle">
                                      <span className="text-sm font-medium text-stone-700">
                                        {topic.examQuestionCount != null ? topic.examQuestionCount : '–'}
                                      </span>
                                    </td>
                                    <td className="px-3 py-3 text-center align-middle">
                                      {editingTopicId === topic.id && editValues ? (
                                        <input
                                          type="number"
                                          min="0"
                                          value={editValues.totalQuestions === 0 ? '' : editValues.totalQuestions}
                                          onChange={(e) => setEditValues({
                                            ...editValues,
                                            totalQuestions: e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0,
                                          })}
                                          placeholder="–"
                                          className="w-14 px-2 py-2 text-sm text-center border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
                                          disabled={updatingTopicId === topic.id}
                                        />
                                      ) : (
                                        <div className="flex items-center justify-center gap-1.5">
                                          <span className={`text-sm font-semibold ${
                                            topic.totalQuestions > 0 ? 'text-stone-800' : 'text-stone-400'
                                          }`}>
                                            {topic.totalQuestions > 0 ? topic.totalQuestions : '–'}
                                          </span>
                                          {!editingTopicId && (
                                            <button
                                              onClick={() => startEdit(topic)}
                                              className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors text-stone-500 hover:text-stone-700"
                                              title="Düzenle"
                                            >
                                              <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-3 py-3 text-center align-middle">
                                      {editingTopicId === topic.id && editValues ? (
                                        <input
                                          type="number"
                                          min="0"
                                          max={editValues.totalQuestions}
                                          value={editValues.correctAnswers === 0 ? '' : editValues.correctAnswers}
                                          onChange={(e) => setEditValues({
                                            ...editValues,
                                            correctAnswers: e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0,
                                          })}
                                          placeholder="–"
                                          className="w-14 px-2 py-2 text-sm text-center border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 text-green-700 font-semibold"
                                          disabled={updatingTopicId === topic.id}
                                        />
                                      ) : (
                                        <span className={`text-sm font-semibold ${
                                          topic.correctAnswers > 0 ? 'text-green-600' : 'text-stone-400'
                                        }`}>
                                          {topic.correctAnswers > 0 ? topic.correctAnswers : '–'}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-3 py-3 text-center align-middle">
                                      {editingTopicId === topic.id && editValues ? (
                                        <div className="flex items-center justify-center gap-1 flex-nowrap min-w-0">
                                          <input
                                            type="number"
                                            min="0"
                                            max={Math.max(0, editValues.totalQuestions - editValues.correctAnswers)}
                                            value={editValues.wrongAnswers === 0 ? '' : editValues.wrongAnswers}
                                            onChange={(e) => setEditValues({
                                              ...editValues,
                                              wrongAnswers: e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0,
                                            })}
                                            placeholder="–"
                                            className="w-12 flex-shrink-0 px-1.5 py-1.5 text-sm text-center border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 text-red-700 font-semibold"
                                            disabled={updatingTopicId === topic.id}
                                          />
                                          <button
                                            onClick={() => updateQuestionStats(topic.id)}
                                            disabled={updatingTopicId === topic.id}
                                            className="flex-shrink-0 p-1.5 hover:bg-green-100 rounded-lg transition-colors text-green-600 disabled:opacity-50"
                                            title="Kaydet"
                                          >
                                            <Save className="h-3.5 w-3.5" />
                                          </button>
                                          <button
                                            onClick={cancelEdit}
                                            disabled={updatingTopicId === topic.id}
                                            className="flex-shrink-0 p-1.5 hover:bg-red-100 rounded-lg transition-colors text-red-600 disabled:opacity-50"
                                            title="İptal"
                                          >
                                            <X className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <span className={`text-sm font-semibold ${
                                          topic.wrongAnswers > 0 ? 'text-red-600' : 'text-stone-400'
                                        }`}>
                                          {topic.wrongAnswers > 0 ? topic.wrongAnswers : '–'}
                                        </span>
                                      )}
                                    </td>
                                    {detailData?.evaluation && topic.evaluation && (
                                      <>
                                        <td className="px-3 py-3 text-center align-middle">
                                          <span className="text-sm font-semibold text-primary-600">
                                            {topic.evaluation.topicNet.toFixed(2)}
                                          </span>
                                        </td>
                                        <td className="px-3 py-3 text-center align-middle">
                                          <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-sm font-semibold text-stone-800">
                                              {(topic.evaluation.topicSuccessRate * 100).toFixed(1)}%
                                            </span>
                                            {detailData.evaluation.requiredSuccessRate != null && (
                                              <span className="text-xs text-stone-500">
                                                Hedef: {(detailData.evaluation.requiredSuccessRate * 100).toFixed(1)}%
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className={`px-3 py-3 text-center align-middle sticky right-0 z-[1] ${statusConfig.bgColor} shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]`}>
                                          {topic.evaluation.isGood ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
                                              <CheckCircle className="h-3.5 w-3.5" />
                                              İYİ
                                            </span>
                                          ) : topic.evaluation.isImprovable ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                                              <TrendingUp className="h-3.5 w-3.5" />
                                              GELİŞTİR
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                                              <RefreshCw className="h-3.5 w-3.5" />
                                              TEKRAR
                                            </span>
                                          )}
                                        </td>
                                      </>
                                    )}
                                    {detailData?.evaluation && !topic.evaluation && (
                                      <>
                                        <td className="px-3 py-3 text-center align-middle"><span className="text-stone-400">–</span></td>
                                        <td className="px-3 py-3 text-center align-middle"><span className="text-stone-400">–</span></td>
                                        <td className={`px-3 py-3 text-center align-middle sticky right-0 z-[1] ${statusConfig.bgColor} shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]`}><span className="text-stone-400">–</span></td>
                                      </>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          ) : (
                          <div className="p-10 text-center sm:p-14">
                            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500">
                              <FileText className="h-7 w-7" />
                            </div>
                            <p className="font-medium text-stone-600 dark:text-stone-400">Bu ders için henüz konu yok</p>
                            <p className="mt-1 text-sm text-stone-500 dark:text-stone-500">Konu eklendiğinde burada listelenecek</p>
                          </div>
                        )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!isLoading && (!detailData?.exam || detailData.sections.length === 0) && (
          <div className="rounded-xl border border-stone-100 bg-white p-8 text-center shadow-xl dark:border-stone-800 dark:bg-stone-900/90 sm:rounded-2xl sm:p-16">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-950 dark:to-primary-900">
              <BookOpen className="h-10 w-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-stone-900 dark:text-stone-100">Aktif sınav bulunamadı</h3>
            <p className="mx-auto max-w-md text-stone-600 dark:text-stone-400">
              Detaylı istatistikler için bir sınava kayıt olmanız gerekiyor.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
