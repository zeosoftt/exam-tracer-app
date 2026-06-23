'use client';

import type { Dispatch, SetStateAction } from 'react';
import {
  CheckCircle,
  ChevronDown,
  Edit2,
  FileText,
  RefreshCw,
  Save,
  TrendingUp,
  X,
} from 'lucide-react';
import type { EvaluationFilter } from '@/components/dashboard/domain/dashboardTypes';
import type { DetailData, Subject, Topic } from '@/components/dashboard/detail/dashboardDetailTypes';
import { EvaluationTopicFilters } from '@/components/dashboard/detail/EvaluationTopicFilters';
import {
  computeDetailTopicAverages,
  countDetailTopicEvaluation,
  filterDetailTopicsByEvaluation,
} from '@/components/dashboard/detail/detailTopicEvaluation';
import { getTopicStatusConfig, type TopicStatusValue } from '@/components/dashboard/detail/topicStatusConfig';

type TopicEditValues = {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
};

type DashboardDetailTopicsTableProps = {
  subject: Subject;
  evaluation: DetailData['evaluation'];
  evaluationFilter: EvaluationFilter;
  setEvaluationFilter: Dispatch<SetStateAction<EvaluationFilter>>;
  updatingTopicId: string | null;
  editingTopicId: string | null;
  editValues: TopicEditValues | null;
  setEditValues: Dispatch<SetStateAction<TopicEditValues | null>>;
  onUpdateStatus: (topicId: string, status: TopicStatusValue) => void;
  onUpdateQuestionStats: (topicId: string) => void;
  onStartEdit: (topic: Topic) => void;
  onCancelEdit: () => void;
};

export function DashboardDetailTopicsTable({
  subject,
  evaluation,
  evaluationFilter,
  setEvaluationFilter,
  updatingTopicId,
  editingTopicId,
  editValues,
  setEditValues,
  onUpdateStatus,
  onUpdateQuestionStats,
  onStartEdit,
  onCancelEdit,
}: DashboardDetailTopicsTableProps) {
  const evaluationCounts = countDetailTopicEvaluation(subject.topics);
  const filteredTopics = filterDetailTopicsByEvaluation(subject.topics, evaluationFilter);
  const topicAverages = computeDetailTopicAverages(subject.topics);
  const hasTopics = subject.topics.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft dark:border-stone-800 dark:bg-stone-900/90">
      {hasTopics && (
        <div className="border-b border-stone-100 bg-stone-50/50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/50 sm:px-5 sm:py-4">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              <span className="font-semibold text-stone-900 dark:text-stone-100">{subject.topics.length}</span> konu
              {subject.completedTopics > 0 && (
                <>
                  {' '}
                  ·{' '}
                  <span className="font-medium text-primary-600 dark:text-primary-400">
                    {subject.completedTopics} tamamlandı
                  </span>
                </>
              )}
            </p>

            {evaluation ? (
              <EvaluationTopicFilters
                evaluationFilter={evaluationFilter}
                setEvaluationFilter={setEvaluationFilter}
                counts={evaluationCounts}
                filteredCount={filteredTopics.length}
                averageSuccessRate={topicAverages?.averageSuccessRate}
                averageNet={topicAverages?.averageNet}
              />
            ) : null}
          </div>
        </div>
      )}
      <div className="max-h-[min(70vh,600px)] overflow-auto">
        {hasTopics ? (
          evaluationFilter && filteredTopics.length === 0 ? (
            <div className="p-10 text-center text-sm text-stone-500 dark:text-stone-400">
              Bu derste seçilen kategoride konu bulunmuyor.
            </div>
          ) : (
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
                {evaluation && (
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
              {(evaluationFilter ? filteredTopics : subject.topics).map((topic) => {
                const statusConfig = getTopicStatusConfig(topic.status);
                const Icon = statusConfig.icon;

                return (
                  <tr
                    key={topic.id}
                    className={`${statusConfig.bgColor} transition-colors hover:bg-opacity-90 ${editingTopicId === topic.id ? 'ring-1 ring-inset ring-primary-200' : ''}`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 align-middle">
                      <div className="relative z-20 inline-flex items-center">
                        <select
                          value={topic.status}
                          onChange={(e) => onUpdateStatus(topic.id, e.target.value as TopicStatusValue)}
                          disabled={updatingTopicId === topic.id}
                          className={`min-w-[120px] cursor-pointer appearance-none rounded-xl border px-3 py-2 pr-8 text-xs font-semibold transition-all focus:z-30 focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${statusConfig.iconBg} ${statusConfig.color} ${statusConfig.borderColor} ${updatingTopicId === topic.id ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                          <option className="bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100" value="NOT_STARTED">
                            Başlanmadı
                          </option>
                          <option className="bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100" value="IN_PROGRESS">
                            Devam Ediyor
                          </option>
                          <option className="bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100" value="COMPLETED">
                            Tamamlandı
                          </option>
                        </select>
                        <ChevronDown
                          className={`pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 ${statusConfig.color}`}
                        />
                      </div>
                    </td>
                    <td className="min-w-0 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className={`flex-shrink-0 rounded-xl p-2 ${statusConfig.iconBg}`}>
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
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              totalQuestions: e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0,
                            })
                          }
                          placeholder="–"
                          className="w-14 rounded-lg border border-stone-300 px-2 py-2 text-center text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                          disabled={updatingTopicId === topic.id}
                        />
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`text-sm font-semibold ${topic.totalQuestions > 0 ? 'text-stone-800' : 'text-stone-400'}`}
                          >
                            {topic.totalQuestions > 0 ? topic.totalQuestions : '–'}
                          </span>
                          {!editingTopicId && (
                            <button
                              type="button"
                              onClick={() => onStartEdit(topic)}
                              className="rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700"
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
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              correctAnswers: e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0,
                            })
                          }
                          placeholder="–"
                          className="w-14 rounded-lg border border-stone-300 px-2 py-2 text-center text-sm font-semibold text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                          disabled={updatingTopicId === topic.id}
                        />
                      ) : (
                        <span className={`text-sm font-semibold ${topic.correctAnswers > 0 ? 'text-green-600' : 'text-stone-400'}`}>
                          {topic.correctAnswers > 0 ? topic.correctAnswers : '–'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center align-middle">
                      {editingTopicId === topic.id && editValues ? (
                        <div className="flex min-w-0 flex-nowrap items-center justify-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max={Math.max(0, editValues.totalQuestions - editValues.correctAnswers)}
                            value={editValues.wrongAnswers === 0 ? '' : editValues.wrongAnswers}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                wrongAnswers: e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0,
                              })
                            }
                            placeholder="–"
                            className="w-12 flex-shrink-0 rounded-lg border border-stone-300 px-1.5 py-1.5 text-center text-sm font-semibold text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                            disabled={updatingTopicId === topic.id}
                          />
                          <button
                            type="button"
                            onClick={() => onUpdateQuestionStats(topic.id)}
                            disabled={updatingTopicId === topic.id}
                            className="flex-shrink-0 rounded-lg p-1.5 text-green-600 transition-colors hover:bg-green-100 disabled:opacity-50"
                            title="Kaydet"
                          >
                            <Save className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={onCancelEdit}
                            disabled={updatingTopicId === topic.id}
                            className="flex-shrink-0 rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                            title="İptal"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className={`text-sm font-semibold ${topic.wrongAnswers > 0 ? 'text-red-600' : 'text-stone-400'}`}>
                          {topic.wrongAnswers > 0 ? topic.wrongAnswers : '–'}
                        </span>
                      )}
                    </td>
                    {evaluation && topic.evaluation && (
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
                            {evaluation.requiredSuccessRate != null && (
                              <span className="text-xs text-stone-500">
                                Hedef: {(evaluation.requiredSuccessRate * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          className={`sticky right-0 z-[1] px-3 py-3 text-center align-middle ${statusConfig.bgColor} shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]`}
                        >
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
                    {evaluation && !topic.evaluation && (
                      <>
                        <td className="px-3 py-3 text-center align-middle">
                          <span className="text-stone-400">–</span>
                        </td>
                        <td className="px-3 py-3 text-center align-middle">
                          <span className="text-stone-400">–</span>
                        </td>
                        <td
                          className={`sticky right-0 z-[1] px-3 py-3 text-center align-middle ${statusConfig.bgColor} shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.06)]`}
                        >
                          <span className="text-stone-400">–</span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          )
        ) : (
          <div className="p-10 text-center sm:p-14">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500">
              <FileText className="h-7 w-7" />
            </div>
            <p className="font-medium text-stone-600 dark:text-stone-400">Bu ders için henüz konu yok</p>
            <p className="mt-1 text-sm text-stone-500">Konu eklendiğinde burada listelenecek</p>
          </div>
        )}
      </div>
    </div>
  );
}
