'use client';

import {
  BarChart3,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Edit2,
  RefreshCw,
  Save,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type {
  DashboardEvaluationTopic,
  DashboardStats,
  EvaluationFilter,
  TopicEditValues,
} from '@/components/dashboard/domain/dashboardTypes';
import type { useDashboardViewModel } from '@/components/dashboard/hooks/useDashboardViewModel';

type DashboardViewModel = ReturnType<typeof useDashboardViewModel>;
type EvaluationData = NonNullable<DashboardStats['evaluation']>;

type DashboardEvaluationSectionProps = {
  evaluation: EvaluationData;
  vm: DashboardViewModel;
  evaluationFilter: EvaluationFilter;
  setEvaluationFilter: React.Dispatch<React.SetStateAction<EvaluationFilter>>;
  editingTopicId: string | null;
  editValues: TopicEditValues | null;
  setEditValues: React.Dispatch<React.SetStateAction<TopicEditValues | null>>;
  expandedSections: Set<string>;
  toggleSection: (key: string) => void;
  startEdit: (topic: DashboardEvaluationTopic) => void;
  cancelEdit: () => void;
  updateQuestionStats: (topicId: string) => void;
};

export function DashboardEvaluationSection({
  evaluation,
  vm,
  evaluationFilter,
  setEvaluationFilter,
  editingTopicId,
  editValues,
  setEditValues,
  expandedSections,
  toggleSection,
  startEdit,
  cancelEdit,
  updateQuestionStats,
}: DashboardEvaluationSectionProps) {
  return (
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
              Hedef {evaluation.targetScore}/100
            </span>
            <span>Gerekli net: {evaluation.requiredNet.toFixed(1)}</span>
            <span>Gerekli başarı: {(evaluation.requiredSuccessRate * 100).toFixed(1)}%</span>
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
          <div className="mb-1 text-3xl font-bold text-success-600">{evaluation.goodTopics}</div>
          <div className="text-xs text-stone-500">
            {evaluation.totalTopics > 0 ? Math.round((evaluation.goodTopics / evaluation.totalTopics) * 100) : 0}% konu
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
          <div className="mb-1 text-3xl font-bold text-accent-600">{evaluation.improvableTopics}</div>
          <div className="text-xs text-stone-500">
            {evaluation.totalTopics > 0 ? Math.round((evaluation.improvableTopics / evaluation.totalTopics) * 100) : 0}% konu
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
          <div className="mb-1 text-3xl font-bold text-danger-600">{evaluation.repeatTopics}</div>
          <div className="text-xs text-stone-500">
            {evaluation.totalTopics > 0 ? Math.round((evaluation.repeatTopics / evaluation.totalTopics) * 100) : 0}% konu
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
          <div className="mb-1 text-2xl font-bold text-primary-600">{(evaluation.averageSuccessRate * 100).toFixed(1)}%</div>
          <div className="text-xs text-stone-500">Net: {evaluation.averageNet.toFixed(2)}</div>
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

      {evaluation.topics && evaluation.topics.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950/50">
          <div className="border-b border-stone-200 bg-gradient-to-r from-stone-50 to-primary-50/40 p-4 dark:border-stone-800 dark:from-stone-900 dark:to-primary-950/20 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">Konu bazında soru istatistikleri</h3>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                  {evaluationFilter
                    ? `${evaluationFilter === 'GOOD' ? 'İyi' : evaluationFilter === 'IMPROVABLE' ? 'Geliştirilebilir' : 'Tekrar'} konuları (${vm.filteredEvaluationTopics.length} konu)`
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
            {evaluationFilter && vm.filteredEvaluationTopics.length === 0 ? (
              <div className="p-10 text-center text-sm text-stone-500 dark:text-stone-400">Bu kategoride konu bulunmuyor.</div>
            ) : (
              Object.entries(vm.groupedTopics).map(([key, group]) => (
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
                                  Doğru: <span className="font-semibold">{topic.correctAnswers || '—'}</span>
                                </span>
                                <span className="text-danger-700">
                                  Yanlış: <span className="font-semibold">{topic.wrongAnswers || '—'}</span>
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
  );
}
