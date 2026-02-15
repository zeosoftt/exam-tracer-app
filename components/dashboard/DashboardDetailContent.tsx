/**
 * Dashboard Detail Content Component
 * Tab yapısı ile bölüm ve ders ilerlemesi
 */

'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';

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

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard/detail');
        if (response.ok) {
          const data = await response.json();
          setDetailData(data.data);
          // İlk bölümü ve ilk dersi otomatik seç
          if (data.data?.sections?.length > 0) {
            const firstSection = data.data.sections[0];
            setSelectedSectionId(firstSection.id);
            if (firstSection.subjects?.length > 0) {
              setSelectedSubjectId(firstSection.subjects[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

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
        const detailResponse = await fetch('/api/dashboard/detail');
        if (detailResponse.ok) {
          const data = await detailResponse.json();
          setDetailData(data.data);
          // Seçili bölüm ve dersi koru
          if (data.data?.sections) {
            const updatedSection = data.data.sections.find((s: Section) => s.id === selectedSectionId);
            if (updatedSection) {
              const updatedSubject = updatedSection.subjects.find((s: Subject) => s.id === selectedSubjectId);
              if (updatedSubject) {
                setSelectedSubjectId(updatedSubject.id);
              }
            }
          }
        }
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
        const detailResponse = await fetch('/api/dashboard/detail');
        if (detailResponse.ok) {
          const data = await detailResponse.json();
          setDetailData(data.data);
          // Seçili bölüm ve dersi koru
          if (data.data?.sections) {
            const updatedSection = data.data.sections.find((s: Section) => s.id === selectedSectionId);
            if (updatedSection) {
              const updatedSubject = updatedSection.subjects.find((s: Subject) => s.id === selectedSubjectId);
              if (updatedSubject) {
                setSelectedSubjectId(updatedSubject.id);
              }
            }
          }
        }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
            <Link href="/dashboard" className="flex items-center gap-1.5 sm:gap-2 group min-w-0">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition" />
                <BookOpen className="relative h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                Exam Tracker
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 text-sm text-gray-600 min-w-0">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium truncate max-w-[100px] sm:max-w-none">{user.name}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
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
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 sm:mb-8 transition-colors group"
        >
          <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span className="sm:inline">Özet Ekrana Dön</span>
        </Link>

        {/* Bölüm Tabları */}
        {!isLoading && detailData?.sections && detailData.sections.length > 0 && (
          <div className="mb-4 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow">
              {/* Tab Headers */}
              <div className="flex border-b border-gray-200 overflow-x-auto overflow-y-hidden bg-gradient-to-r from-gray-50 to-white scrollbar-thin snap-x snap-mandatory -mx-1 px-1">
                {detailData.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSectionId(section.id)}
                    className={`flex-shrink-0 snap-start px-4 sm:px-8 py-4 sm:py-5 font-semibold text-sm transition-all border-b-3 relative ${
                      selectedSectionId === section.id
                        ? 'border-blue-600 text-blue-600 bg-gradient-to-b from-blue-50 to-white'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                    }`}
                  >
                    {selectedSectionId === section.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    )}
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{section.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          selectedSectionId === section.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {section.totalTopics} konu
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedSectionId === section.id ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <span
                          className={`text-xs font-medium ${
                            selectedSectionId === section.id
                              ? 'text-blue-600'
                              : 'text-gray-500'
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
                  <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {selectedSection.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-gray-600 font-medium">
                              {selectedSection.completedTopics} Tamamlandı
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span className="text-gray-600 font-medium">
                              {selectedSection.inProgressTopics} Devam Ediyor
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <span className="text-gray-600 font-medium">
                              {selectedSection.notStartedTopics} Başlanmadı
                            </span>
                          </div>
                          {selectedSection.reviewedTopics > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                              <span className="text-gray-600 font-medium">
                                {selectedSection.reviewedTopics} Gözden Geçirildi
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          %{selectedSection.progressPercentage}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Tamamlanma</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {selectedSection.completedTopics + selectedSection.reviewedTopics} / {selectedSection.totalTopics} konu
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 w-full bg-white/60 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${selectedSection.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Ders Tabları */}
                  <div className="flex border-b-2 border-gray-200 mb-4 sm:mb-6 overflow-x-auto overflow-y-hidden -mx-1 px-1 scrollbar-thin snap-x snap-mandatory">
                    {selectedSection.subjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => setSelectedSubjectId(subject.id)}
                        className={`flex-shrink-0 snap-start px-3 sm:px-5 py-3 font-semibold text-sm transition-all border-b-3 rounded-t-lg relative ${
                          selectedSubjectId === subject.id
                            ? 'border-purple-600 text-purple-600 bg-gradient-to-b from-purple-50 to-white shadow-sm'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                        }`}
                      >
                        {selectedSubjectId === subject.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-600"></div>
                        )}
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-2">
                            <span>{subject.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                              selectedSubjectId === subject.id
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {subject.totalTopics} konu
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${selectedSubjectId === subject.id ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                            <span
                              className={`text-xs font-medium ${
                                selectedSubjectId === subject.id
                                  ? 'text-purple-600'
                                  : 'text-gray-500'
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
                    <div className="min-h-[200px] sm:min-h-[300px] bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 sm:p-6 lg:p-8 border-2 border-gray-100 shadow-inner">
                      {/* Evaluation Info Card */}
                      {detailData?.evaluation && (
                        <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl border border-blue-200 shadow-sm">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                                <Target className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-sm font-bold text-gray-900">Hedef Puan Temelli Değerlendirme</h5>
                                <p className="text-xs text-gray-600 mt-0.5 break-words">
                                  Hedef: {detailData.evaluation.targetScore}/100 · Gerekli Net: {detailData.evaluation.requiredNet?.toFixed(1) || '-'} · Başarı: {detailData.evaluation.requiredSuccessRate ? (detailData.evaluation.requiredSuccessRate * 100).toFixed(1) : '-'}%
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                <CheckCircle className="h-3 w-3 flex-shrink-0" />
                                İYİ ≥%95
                              </div>
                              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                <TrendingUp className="h-3 w-3 flex-shrink-0" />
                                GELİŞTİRİLEBİLİR ≥%80
                              </div>
                              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                <RefreshCw className="h-3 w-3 flex-shrink-0" />
                                TEKRAR &lt;%80
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                              {selectedSubject.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-gray-600 font-medium">
                                  {selectedSubject.completedTopics} Tamamlandı
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span className="text-gray-600 font-medium">
                                  {selectedSubject.inProgressTopics} Devam Ediyor
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span className="text-gray-600 font-medium">
                                  {selectedSubject.notStartedTopics} Başlanmadı
                                </span>
                              </div>
                              {selectedSubject.reviewedTopics > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                  <span className="text-gray-600 font-medium">
                                    {selectedSubject.reviewedTopics} Gözden Geçirildi
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full sm:ml-4 w-fit">
                            <span className="text-white font-bold text-lg">%{selectedSubject.progressPercentage}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-sm"
                            style={{ width: `${selectedSubject.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Konular Tablosu */}
                      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                          {selectedSubject.topics && selectedSubject.topics.length > 0 ? (
                          <table className="w-full min-w-[640px] sm:min-w-0">
                            <thead>
                              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Durum
                                </th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Konu Adı
                                </th>
                                <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Çözülen
                                </th>
                                <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Doğru
                                </th>
                                <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Yanlış
                                </th>
                                {detailData?.evaluation && (
                                  <>
                                    <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Net
                                    </th>
                                    <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Başarı
                                    </th>
                                    <th className="px-2 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Değerlendirme
                                    </th>
                                  </>
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {selectedSubject.topics.map((topic) => {
                                const getStatusConfig = (status: string) => {
                                  switch (status) {
                                    case 'COMPLETED':
                                      return {
                                        icon: CheckCircle,
                                        color: 'text-green-700',
                                        bgColor: 'bg-green-50',
                                        borderColor: 'border-green-200',
                                        label: 'Tamamlandı',
                                        iconBg: 'bg-green-100',
                                        dotColor: 'bg-green-500',
                                        value: 'COMPLETED' as const,
                                      };
                                    case 'IN_PROGRESS':
                                      return {
                                        icon: PlayCircle,
                                        color: 'text-yellow-700',
                                        bgColor: 'bg-yellow-50',
                                        borderColor: 'border-yellow-200',
                                        label: 'Devam Ediyor',
                                        iconBg: 'bg-yellow-100',
                                        dotColor: 'bg-yellow-500',
                                        value: 'IN_PROGRESS' as const,
                                      };
                                    default:
                                      return {
                                        icon: Circle,
                                        color: 'text-gray-500',
                                        bgColor: 'bg-gray-50',
                                        borderColor: 'border-gray-200',
                                        label: 'Başlanmadı',
                                        iconBg: 'bg-gray-100',
                                        dotColor: 'bg-gray-400',
                                        value: 'NOT_STARTED' as const,
                                      };
                                  }
                                };

                                const statusConfig = getStatusConfig(topic.status);
                                const Icon = statusConfig.icon;

                                return (
                                  <tr
                                    key={topic.id}
                                    className={`${statusConfig.bgColor} hover:bg-opacity-80 transition-colors cursor-pointer`}
                                  >
                                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                      <div className="relative inline-flex items-center">
                                        <select
                                          value={topic.status}
                                          onChange={(e) => updateTopicStatus(topic.id, e.target.value as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED')}
                                          disabled={updatingTopicId === topic.id}
                                          className={`appearance-none pr-7 pl-2 sm:pl-3 py-1.5 rounded-full text-xs font-semibold border-2 cursor-pointer transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[110px] sm:min-w-[130px] ${
                                            statusConfig.iconBg
                                          } ${statusConfig.color} ${statusConfig.borderColor} ${
                                            updatingTopicId === topic.id ? 'opacity-50 cursor-not-allowed' : ''
                                          }`}
                                        >
                                          <option value="NOT_STARTED">Başlanmadı</option>
                                          <option value="IN_PROGRESS">Devam Ediyor</option>
                                          <option value="COMPLETED">Tamamlandı</option>
                                        </select>
                                        <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${statusConfig.color} pointer-events-none`} />
                                      </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${statusConfig.iconBg}`}>
                                          <Icon className={`h-4 w-4 ${statusConfig.color}`} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 truncate">
                                          {topic.name}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                                      {editingTopicId === topic.id && editValues ? (
                                        <div className="flex items-center justify-center gap-2">
                                          <input
                                            type="number"
                                            min="0"
                                            value={editValues.totalQuestions}
                                            onChange={(e) => setEditValues({
                                              ...editValues,
                                              totalQuestions: parseInt(e.target.value) || 0,
                                            })}
                                            className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={updatingTopicId === topic.id}
                                          />
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-center gap-2">
                                          <span className={`text-sm font-semibold ${
                                            topic.totalQuestions > 0 ? 'text-gray-700' : 'text-gray-400'
                                          }`}>
                                            {topic.totalQuestions > 0 ? topic.totalQuestions : '-'}
                                          </span>
                                          {!editingTopicId && (
                                            <button
                                              onClick={() => startEdit(topic)}
                                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                                              title="Düzenle"
                                            >
                                              <Edit2 className="h-3 w-3 text-gray-500" />
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                                      {editingTopicId === topic.id && editValues ? (
                                        <input
                                          type="number"
                                          min="0"
                                          max={editValues.totalQuestions}
                                          value={editValues.correctAnswers}
                                          onChange={(e) => setEditValues({
                                            ...editValues,
                                            correctAnswers: parseInt(e.target.value) || 0,
                                          })}
                                          className="w-12 sm:w-16 px-1 sm:px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-green-600 font-semibold"
                                          disabled={updatingTopicId === topic.id}
                                        />
                                      ) : (
                                        <span className={`text-sm font-semibold ${
                                          topic.correctAnswers > 0 ? 'text-green-600' : 'text-gray-400'
                                        }`}>
                                          {topic.correctAnswers > 0 ? topic.correctAnswers : '-'}
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                                      {editingTopicId === topic.id && editValues ? (
                                        <div className="flex items-center justify-center gap-2">
                                          <input
                                            type="number"
                                            min="0"
                                            max={editValues.totalQuestions - editValues.correctAnswers}
                                            value={editValues.wrongAnswers}
                                            onChange={(e) => setEditValues({
                                              ...editValues,
                                              wrongAnswers: parseInt(e.target.value) || 0,
                                            })}
                                            className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-red-600 font-semibold"
                                            disabled={updatingTopicId === topic.id}
                                          />
                                          <button
                                            onClick={() => updateQuestionStats(topic.id)}
                                            disabled={updatingTopicId === topic.id}
                                            className="p-1.5 hover:bg-green-100 rounded transition-colors text-green-600 disabled:opacity-50"
                                            title="Kaydet"
                                          >
                                            <Save className="h-3.5 w-3.5" />
                                          </button>
                                          <button
                                            onClick={cancelEdit}
                                            disabled={updatingTopicId === topic.id}
                                            className="p-1.5 hover:bg-red-100 rounded transition-colors text-red-600 disabled:opacity-50"
                                            title="İptal"
                                          >
                                            <X className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <span className={`text-sm font-semibold ${
                                          topic.wrongAnswers > 0 ? 'text-red-600' : 'text-gray-400'
                                        }`}>
                                          {topic.wrongAnswers > 0 ? topic.wrongAnswers : '-'}
                                        </span>
                                      )}
                                    </td>
                                    {detailData?.evaluation && topic.evaluation && (
                                      <>
                                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                                          <span className="text-sm font-semibold text-blue-600">
                                            {topic.evaluation.topicNet.toFixed(2)}
                                          </span>
                                        </td>
                                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                                          <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-sm font-semibold text-gray-700">
                                              {(topic.evaluation.topicSuccessRate * 100).toFixed(1)}%
                                            </span>
                                            {detailData.evaluation.requiredSuccessRate && (
                                              <span className="text-xs text-gray-500 hidden sm:block">
                                                Hedef: {(detailData.evaluation.requiredSuccessRate * 100).toFixed(1)}%
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                                          {topic.evaluation.isGood ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                              <CheckCircle className="h-3 w-3" />
                                              İYİ
                                            </span>
                                          ) : topic.evaluation.isImprovable ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                              <TrendingUp className="h-3 w-3" />
                                              GELİŞTİRİLEBİLİR
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                                              <RefreshCw className="h-3 w-3" />
                                              TEKRAR
                                            </span>
                                          )}
                                        </td>
                                      </>
                                    )}
                                    {detailData?.evaluation && !topic.evaluation && (
                                      <>
                                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                                          <span className="text-sm text-gray-400">-</span>
                                        </td>
                                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                                          <span className="text-sm text-gray-400">-</span>
                                        </td>
                                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-center">
                                          <span className="text-sm text-gray-400">-</span>
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          ) : (
                          <div className="bg-white/60 rounded-lg p-8 sm:p-12 border border-gray-200 text-center">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm font-medium">
                              Bu ders için henüz konu bulunmuyor
                            </p>
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
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-8 sm:p-16 border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-6">
              <BookOpen className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aktif sınav bulunamadı</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Detaylı istatistikler için bir sınava kayıt olmanız gerekiyor.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
