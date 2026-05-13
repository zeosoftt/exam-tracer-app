'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Layers,
  FileText,
  FolderOpen,
  Loader2,
  GripVertical,
} from 'lucide-react';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';
import { useExamContentManager } from '@/components/super-admin/hooks/useExamContentManager';

export function ExamContentManager() {
  const {
    exams,
    loading,
    error,
    expandedExam,
    expandedSection,
    expandedSubject,
    modal,
    form,
    setForm,
    saving,
    actionError,
    setActionError,
    deletingId,
    draggedTopicId,
    reorderingSubjectId,
    toggleExam,
    toggleSection,
    toggleSubject,
    openAdd,
    openEdit,
    closeModal,
    save,
    remove,
    handleTopicDragStart,
    handleTopicDragOver,
    handleTopicDrop,
    handleTopicDragEnd,
  } = useExamContentManager();

  const renderModal = () => {
    if (!modal) return null;
    const title =
      modal.edit
        ? (modal.type === 'exam' ? 'Sınav düzenle' : modal.type === 'section' ? 'Bölüm düzenle' : modal.type === 'subject' ? 'Ders düzenle' : 'Konu düzenle')
        : (modal.type === 'exam' ? 'Yeni sınav' : modal.type === 'section' ? 'Yeni bölüm' : modal.type === 'subject' ? 'Yeni ders' : 'Yeni konu');
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70" onClick={closeModal}>
        <div
          className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-xl dark:border-stone-700 dark:bg-stone-900"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="mb-4 text-lg font-bold text-stone-900 dark:text-stone-100">{title}</h3>
          {actionError && <p className="mb-2 text-sm text-red-600 dark:text-red-400">{actionError}</p>}
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">Ad</label>
              <input
                type="text"
                value={String(form.name ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input w-full rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">Kod</label>
              <input
                type="text"
                value={String(form.code ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                className="input w-full rounded-lg px-3 py-2 text-sm"
                placeholder={modal.type === 'exam' ? 'KPSS' : 'örn: MAT'}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">Açıklama (opsiyonel)</label>
              <input
                type="text"
                value={String(form.description ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="input w-full rounded-lg px-3 py-2 text-sm"
              />
            </div>
            {modal.type === 'exam' && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">Sınav tarihi</label>
                  <input
                    type="date"
                    value={String(form.startDate ?? '')}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value || '' }))}
                    className="input w-full rounded-lg px-3 py-2 text-sm"
                  />
                  <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                    Dashboard hedef kartında &quot;Sınava X gün kaldı&quot; gösterilir.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">Durum</label>
                  <select
                    value={String(form.status ?? 'ACTIVE')}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="input w-full rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">Pasif</option>
                    <option value="ARCHIVED">Arşiv</option>
                  </select>
                </div>
              </>
            )}
            {(modal.type === 'section' || modal.type === 'subject' || modal.type === 'topic') && (
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">Sıra</label>
                <input
                  type="number"
                  min={0}
                  value={Number(form.order ?? 0)}
                  onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))}
                  className="input w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}
            {modal.type === 'topic' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400">
                  Soru dağılımı (sınavda kaç soru)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.examQuestionCount === '' || form.examQuestionCount == null ? '' : form.examQuestionCount}
                  onChange={(e) => setForm((f) => ({ ...f, examQuestionCount: e.target.value === '' ? '' : parseInt(e.target.value, 10) }))}
                  className="input w-full rounded-lg px-3 py-2 text-sm"
                  placeholder="Boş bırakılabilir"
                />
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              İptal
            </button>
            <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {modal.edit ? 'Kaydet' : 'Ekle'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="border-b border-stone-200 bg-white/90 shadow-sm backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2">
            <Link
              href="/dashboard/super-admin"
              className="flex items-center gap-2 text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Super Admin</span>
            </Link>
            <h1 className="text-center text-lg font-semibold text-stone-900 dark:text-stone-100 sm:flex-1">
              Sınav & İçerik Yönetimi
            </h1>
            <div className="flex w-28 justify-end">
              <ThemeToggleCompact />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {actionError && !modal && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {actionError}
            <button type="button" onClick={() => setActionError(null)} className="ml-2 underline">
              Kapat
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-stone-600 dark:text-stone-400">Sınav → Bölüm → Ders → Konu ağacını buradan yönetin.</p>
          <button
            type="button"
            onClick={() => openAdd('exam')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Yeni sınav
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : exams.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-500 dark:border-stone-800 dark:bg-stone-900/90 dark:text-stone-400">
            Henüz sınav yok. &quot;Yeni sınav&quot; ile ekleyin.
          </div>
        ) : (
          <div className="space-y-1 overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/90">
            {exams.map((exam) => (
              <div key={exam.id} className="border-b border-stone-100 last:border-b-0 dark:border-stone-800">
                <div className="flex items-center gap-2 bg-stone-50/80 px-4 py-3 dark:bg-stone-950/60">
                  <button
                    type="button"
                    onClick={() => toggleExam(exam.id)}
                    className="rounded p-0.5 hover:bg-stone-200 dark:hover:bg-stone-700"
                  >
                    {expandedExam.has(exam.id) ? (
                      <ChevronDown className="h-4 w-4 text-stone-600 dark:text-stone-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-stone-600 dark:text-stone-400" />
                    )}
                  </button>
                  <BookOpen className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{exam.name}</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">({exam.code})</span>
                  {exam.startDate ? (
                    <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                      Sınav: {new Date(exam.startDate).toLocaleDateString('tr-TR')}
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400 dark:text-stone-500">Tarih yok</span>
                  )}
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs ${
                      exam.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300'
                        : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                    }`}
                  >
                    {exam.status}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit('exam', exam)}
                      className="rounded p-1.5 text-stone-600 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-700"
                      title="Düzenle"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove('exam', exam.id)}
                      disabled={deletingId === exam.id}
                      className="rounded p-1.5 text-red-600 hover:bg-red-100 disabled:opacity-50 dark:hover:bg-red-950/40"
                      title="Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openAdd('section', exam.id)}
                      className="rounded p-1.5 text-primary-600 hover:bg-primary-100 dark:text-primary-400 dark:hover:bg-primary-950/40"
                      title="Bölüm ekle"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {expandedExam.has(exam.id) && (
                  <div className="pl-8 pr-4 pb-2">
                    {exam.sections.length === 0 ? (
                      <p className="py-2 text-xs text-stone-500 dark:text-stone-400">Bölüm yok. + ile ekleyin.</p>
                    ) : (
                      exam.sections.map((section) => (
                        <div key={section.id} className="mt-2 rounded-lg border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900/80">
                          <div className="flex items-center gap-2 px-3 py-2">
                            <button
                              type="button"
                              onClick={() => toggleSection(section.id)}
                              className="rounded p-0.5 hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                              {expandedSection.has(section.id) ? (
                                <ChevronDown className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-stone-500 dark:text-stone-400" />
                              )}
                            </button>
                            <Layers className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            <span className="text-sm font-medium text-stone-800 dark:text-stone-100">{section.name}</span>
                            <span className="text-xs text-stone-400 dark:text-stone-500">({section.code})</span>
                            <div className="ml-auto flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEdit('section', section)}
                                className="rounded p-1 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                                title="Düzenle"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => remove('section', section.id)}
                                disabled={deletingId === section.id}
                                className="rounded p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/40"
                                title="Sil"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openAdd('subject', section.id)}
                                className="rounded p-1 text-primary-600 hover:bg-primary-100 dark:text-primary-400 dark:hover:bg-primary-950/40"
                                title="Ders ekle"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          {expandedSection.has(section.id) && (
                            <div className="pl-6 pr-2 pb-2">
                              {section.subjects.length === 0 ? (
                                <p className="py-1 text-xs text-stone-500 dark:text-stone-400">Ders yok. + ile ekleyin.</p>
                              ) : (
                                section.subjects.map((subject) => (
                                  <div
                                    key={subject.id}
                                    className="mt-1 rounded border border-stone-100 bg-stone-50/50 dark:border-stone-800 dark:bg-stone-950/40"
                                  >
                                    <div className="flex items-center gap-2 px-2 py-1.5">
                                      <button
                                        type="button"
                                        onClick={() => toggleSubject(subject.id)}
                                        className="rounded p-0.5 hover:bg-stone-200 dark:hover:bg-stone-800"
                                      >
                                        {expandedSubject.has(subject.id) ? (
                                          <ChevronDown className="h-3 w-3 text-stone-500 dark:text-stone-400" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3 text-stone-500 dark:text-stone-400" />
                                        )}
                                      </button>
                                      <FileText className="h-3 w-3 text-green-600 dark:text-green-400" />
                                      <span className="text-xs font-medium text-stone-700 dark:text-stone-200">{subject.name}</span>
                                      <span className="text-xs text-stone-400 dark:text-stone-500">({subject.code})</span>
                                      <div className="ml-auto flex items-center gap-0.5">
                                        <button
                                          type="button"
                                          onClick={() => openEdit('subject', subject)}
                                          className="rounded p-1 text-stone-500 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800"
                                          title="Düzenle"
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => remove('subject', subject.id)}
                                          disabled={deletingId === subject.id}
                                          className="rounded p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/40"
                                          title="Sil"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => openAdd('topic', subject.id)}
                                          className="rounded p-1 text-primary-600 hover:bg-primary-100 dark:text-primary-400 dark:hover:bg-primary-950/40"
                                          title="Konu ekle"
                                        >
                                          <Plus className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                    {expandedSubject.has(subject.id) && (
                                      <div className="pl-5 pr-2 pb-1">
                                        {subject.topics.length === 0 ? (
                                          <p className="py-1 text-xs text-stone-400 dark:text-stone-500">Konu yok. + ile ekleyin.</p>
                                        ) : (
                                          subject.topics.map((topic) => (
                                            <div
                                              key={topic.id}
                                              data-topic-id={topic.id}
                                              draggable
                                              onDragStart={(e) => handleTopicDragStart(e, topic.id)}
                                              onDragOver={handleTopicDragOver}
                                              onDrop={(e) => handleTopicDrop(e, subject, topic.id)}
                                              onDragEnd={handleTopicDragEnd}
                                              className={`flex cursor-grab items-center gap-2 rounded px-2 py-1 hover:bg-stone-100/80 active:cursor-grabbing dark:hover:bg-stone-800/80 ${draggedTopicId === topic.id ? 'opacity-50' : ''} ${reorderingSubjectId === subject.id ? 'pointer-events-none' : ''}`}
                                            >
                                              <GripVertical className="h-3.5 w-3.5 shrink-0 text-stone-400 dark:text-stone-500" aria-hidden />
                                              <FolderOpen className="h-3 w-3 shrink-0 text-stone-400 dark:text-stone-500" />
                                              <span className="text-xs text-stone-700 dark:text-stone-200">{topic.name}</span>
                                              <span className="text-xs text-stone-400 dark:text-stone-500">({topic.code})</span>
                                              {topic.examQuestionCount != null && (
                                                <span className="text-xs text-primary-600 dark:text-primary-400">{topic.examQuestionCount} soru</span>
                                              )}
                                              <div className="ml-auto flex items-center gap-0.5">
                                                <button
                                                  type="button"
                                                  onClick={() => openEdit('topic', topic)}
                                                  className="rounded p-0.5 text-stone-500 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-700"
                                                  title="Düzenle"
                                                >
                                                  <Pencil className="h-3 w-3" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => remove('topic', topic.id)}
                                                  disabled={deletingId === topic.id}
                                                  className="rounded p-0.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/40"
                                                  title="Sil"
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </button>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {renderModal()}
      </main>
    </div>
  );
}
