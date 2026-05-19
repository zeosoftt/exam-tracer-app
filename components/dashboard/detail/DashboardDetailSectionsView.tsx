'use client';

import type { DashboardDetailPageState } from '@/components/dashboard/hooks/useDashboardDetailPage';
import { DashboardDetailEvaluationBanner } from '@/components/dashboard/detail/DashboardDetailEvaluationBanner';
import { DashboardDetailTopicsTable } from '@/components/dashboard/detail/DashboardDetailTopicsTable';

type DashboardDetailSectionsViewProps = Pick<
  DashboardDetailPageState,
  | 'detailData'
  | 'selectedSectionId'
  | 'setSelectedSectionId'
  | 'selectedSubjectId'
  | 'setSelectedSubjectId'
  | 'selectedSection'
  | 'selectedSubject'
  | 'updatingTopicId'
  | 'editingTopicId'
  | 'editValues'
  | 'setEditValues'
  | 'updateTopicStatus'
  | 'updateQuestionStats'
  | 'startEdit'
  | 'cancelEdit'
>;

export function DashboardDetailSectionsView({
  detailData,
  selectedSectionId,
  setSelectedSectionId,
  selectedSubjectId,
  setSelectedSubjectId,
  selectedSection,
  selectedSubject,
  updatingTopicId,
  editingTopicId,
  editValues,
  setEditValues,
  updateTopicStatus,
  updateQuestionStats,
  startEdit,
  cancelEdit,
}: DashboardDetailSectionsViewProps) {
  if (!detailData?.sections?.length) return null;

  return (
    <div className="mb-4 sm:mb-8">
      <div className="overflow-hidden rounded-xl border border-stone-100 bg-white shadow-xl transition-shadow hover:shadow-2xl dark:border-stone-800 dark:bg-stone-900/90 sm:rounded-2xl">
        <div className="-mx-1 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden border-b border-stone-200 bg-gradient-to-r from-stone-50 to-white scrollbar-thin dark:border-stone-800 dark:from-stone-900 dark:to-stone-950">
          {detailData.sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setSelectedSectionId(section.id)}
              className={`relative flex-shrink-0 snap-start border-b-3 px-4 py-4 text-sm font-semibold transition-all sm:px-8 sm:py-5 ${
                selectedSectionId === section.id
                  ? 'border-primary-600 bg-gradient-to-b from-primary-50 to-white text-primary-600 dark:border-primary-500 dark:from-primary-950/40 dark:to-stone-900 dark:text-primary-400'
                  : 'border-transparent text-stone-600 hover:bg-stone-50/50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/50 dark:hover:text-stone-100'
              }`}
            >
              {selectedSectionId === section.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600" />
              )}
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{section.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      selectedSectionId === section.id
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
                        : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                    }`}
                  >
                    {section.totalTopics} konu
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${selectedSectionId === section.id ? 'bg-primary-500' : 'bg-stone-300 dark:bg-stone-600'}`}
                  />
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

        {selectedSection && (
          <div className="p-8">
            <div className="mb-6 rounded-xl border border-primary-100 bg-gradient-to-br bg-primary-50 p-6 dark:border-primary-900/40 dark:bg-primary-950/25">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="mb-2 text-2xl font-bold text-stone-900 dark:text-stone-100">{selectedSection.name}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="font-medium text-stone-600 dark:text-stone-400">
                        {selectedSection.completedTopics} Tamamlandı
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span className="font-medium text-stone-600 dark:text-stone-400">
                        {selectedSection.inProgressTopics} Devam Ediyor
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-stone-400" />
                      <span className="font-medium text-stone-600 dark:text-stone-400">
                        {selectedSection.notStartedTopics} Başlanmadı
                      </span>
                    </div>
                    {selectedSection.reviewedTopics > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-primary-500" />
                        <span className="font-medium text-stone-600 dark:text-stone-400">
                          {selectedSection.reviewedTopics} Gözden Geçirildi
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 text-left sm:text-right">
                  <div className="text-3xl font-extrabold text-primary-800 dark:text-primary-200 sm:text-4xl">
                    %{selectedSection.progressPercentage}
                  </div>
                  <p className="text-xs font-medium text-stone-600 dark:text-stone-300">Tamamlanma</p>
                  <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                    {selectedSection.completedTopics + selectedSection.reviewedTopics} / {selectedSection.totalTopics} konu
                  </p>
                </div>
              </div>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/60 dark:bg-stone-800/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-700 ease-out"
                  style={{ width: `${selectedSection.progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="-mx-1 mb-4 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden border-b-2 border-stone-200 px-1 scrollbar-thin dark:border-stone-700 sm:mb-6">
              {selectedSection.subjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className={`relative flex-shrink-0 snap-start rounded-t-lg border-b-3 px-3 py-3 text-sm font-semibold transition-all sm:px-5 ${
                    selectedSubjectId === subject.id
                      ? 'border-primary-600 bg-gradient-to-b from-primary-50 to-white text-primary-600 shadow-sm dark:border-primary-500 dark:from-primary-950/40 dark:to-stone-900 dark:text-primary-400'
                      : 'border-transparent text-stone-600 hover:bg-stone-50/50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/50 dark:hover:text-stone-100'
                  }`}
                >
                  {selectedSubjectId === subject.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600" />
                  )}
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <span>{subject.name}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                          selectedSubjectId === subject.id
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
                            : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                        }`}
                      >
                        {subject.totalTopics} konu
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${selectedSubjectId === subject.id ? 'bg-primary-500' : 'bg-stone-300 dark:bg-stone-600'}`}
                      />
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

            {selectedSubject && (
              <div className="min-h-[200px] rounded-xl border-2 border-stone-100 bg-gradient-to-br from-white to-stone-50 p-4 shadow-inner dark:border-stone-800 dark:from-stone-900 dark:to-stone-950 sm:min-h-[300px] sm:p-6 lg:p-8">
                {detailData.evaluation && <DashboardDetailEvaluationBanner evaluation={detailData.evaluation} />}

                <div className="mb-4 sm:mb-6">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="mb-2 text-lg font-bold text-stone-900 dark:text-stone-100 sm:text-xl">
                        {selectedSubject.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="font-medium text-stone-600 dark:text-stone-400">
                            {selectedSubject.completedTopics} Tamamlandı
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                          <span className="font-medium text-stone-600 dark:text-stone-400">
                            {selectedSubject.inProgressTopics} Devam Ediyor
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-stone-400" />
                          <span className="font-medium text-stone-600 dark:text-stone-400">
                            {selectedSubject.notStartedTopics} Başlanmadı
                          </span>
                        </div>
                        {selectedSubject.reviewedTopics > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-primary-500" />
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
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 shadow-sm transition-all duration-700 ease-out"
                      style={{ width: `${selectedSubject.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <DashboardDetailTopicsTable
                  subject={selectedSubject}
                  evaluation={detailData.evaluation}
                  updatingTopicId={updatingTopicId}
                  editingTopicId={editingTopicId}
                  editValues={editValues}
                  setEditValues={setEditValues}
                  onUpdateStatus={updateTopicStatus}
                  onUpdateQuestionStats={updateQuestionStats}
                  onStartEdit={startEdit}
                  onCancelEdit={cancelEdit}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
