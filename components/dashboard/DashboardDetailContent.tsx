/**
 * Dashboard Detail Content Component
 * Tab yapısı ile bölüm ve ders ilerlemesi
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
  Circle,
  PlayCircle,
  RotateCcw,
  ChevronDown,
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

interface Topic {
  id: string;
  code: string;
  name: string;
  order: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
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
}

export function DashboardDetailContent({
  user,
}: {
  user: { id: string; name: string; email: string; role: string };
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTopicId, setUpdatingTopicId] = useState<string | null>(null);

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
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
        >
          <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Özet Ekrana Dön
        </Link>

        {/* Bölüm Tabları */}
        {!isLoading && detailData?.sections && detailData.sections.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-shadow">
              {/* Tab Headers */}
              <div className="flex border-b border-gray-200 overflow-x-auto bg-gradient-to-r from-gray-50 to-white">
                {detailData.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSectionId(section.id)}
                    className={`flex-shrink-0 px-8 py-5 font-semibold text-sm transition-all border-b-3 relative ${
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
                      <div className="text-right">
                        <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
                  <div className="flex border-b-2 border-gray-200 mb-6 overflow-x-auto -mx-2 px-2">
                    {selectedSection.subjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => setSelectedSubjectId(subject.id)}
                        className={`flex-shrink-0 px-5 py-3 font-semibold text-sm transition-all border-b-3 rounded-t-lg relative ${
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
                    <div className="min-h-[300px] bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 border-2 border-gray-100 shadow-inner">
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 mb-2">
                              {selectedSubject.name}
                            </h4>
                            <div className="flex items-center gap-3 text-xs">
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
                          <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full ml-4">
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
                      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        {selectedSubject.topics && selectedSubject.topics.length > 0 ? (
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Durum
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Konu Adı
                                </th>
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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="relative inline-flex items-center">
                                        <select
                                          value={topic.status}
                                          onChange={(e) => updateTopicStatus(topic.id, e.target.value as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED')}
                                          disabled={updatingTopicId === topic.id}
                                          className={`appearance-none pr-7 pl-3 py-1.5 rounded-full text-xs font-semibold border-2 cursor-pointer transition-all hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[130px] ${
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
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-lg ${statusConfig.iconBg}`}>
                                          <Icon className={`h-4 w-4 ${statusConfig.color}`} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                          {topic.name}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        ) : (
                          <div className="bg-white/60 rounded-lg p-12 border border-gray-200 text-center">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm font-medium">
                              Bu ders için henüz konu bulunmuyor
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!isLoading && (!detailData?.exam || detailData.sections.length === 0) && (
          <div className="bg-white rounded-2xl shadow-xl p-16 border border-gray-100 text-center">
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
