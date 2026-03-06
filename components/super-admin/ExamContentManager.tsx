'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';

interface TopicNode {
  id: string;
  subjectId: string;
  name: string;
  code: string;
  description: string | null;
  order: number;
  examQuestionCount: number | null;
}

interface SubjectNode {
  id: string;
  sectionId: string;
  name: string;
  code: string;
  description: string | null;
  order: number;
  topics: TopicNode[];
}

interface SectionNode {
  id: string;
  examId: string;
  name: string;
  code: string;
  description: string | null;
  order: number;
  subjects: SubjectNode[];
}

interface ExamNode {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: string;
  sections: SectionNode[];
}

type EntityType = 'exam' | 'section' | 'subject' | 'topic';

export function ExamContentManager() {
  const [exams, setExams] = useState<ExamNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedExam, setExpandedExam] = useState<Set<string>>(new Set());
  const [expandedSection, setExpandedSection] = useState<Set<string>>(new Set());
  const [expandedSubject, setExpandedSubject] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<{
    type: EntityType;
    parentId?: string;
    parentExamId?: string;
    parentSectionId?: string;
    edit?: ExamNode | SectionNode | SubjectNode | TopicNode;
  } | null>(null);
  const [form, setForm] = useState<Record<string, string | number | null>>({});
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTree = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/super-admin/exam-content');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Yüklenemedi');
      }
      const data = await res.json();
      setExams(data.data?.exams ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'İçerik ağacı yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const toggleExam = (id: string) => {
    setExpandedExam((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSection = (id: string) => {
    setExpandedSection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSubject = (id: string) => {
    setExpandedSubject((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAdd = (type: EntityType, parentId?: string, parentExamId?: string, parentSectionId?: string) => {
    setModal({ type, parentId, parentExamId, parentSectionId });
    setForm(type === 'exam' ? { name: '', code: '', description: '', status: 'ACTIVE' } : { name: '', code: '', description: '', order: 0 });
    if (type === 'topic') setForm((f) => ({ ...f, examQuestionCount: '' }));
    setActionError(null);
  };

  const openEdit = (type: EntityType, entity: ExamNode | SectionNode | SubjectNode | TopicNode, parentId?: string) => {
    setModal({ type, parentId, edit: entity });
    const e = entity as Record<string, unknown>;
    setForm({
      name: String(e.name ?? ''),
      code: String(e.code ?? ''),
      description: e.description != null ? String(e.description) : '',
      order: typeof e.order === 'number' ? e.order : 0,
      status: type === 'exam' ? String((e as ExamNode).status) : undefined,
      examQuestionCount: type === 'topic' && e.examQuestionCount != null ? e.examQuestionCount : '',
    });
    setActionError(null);
  };

  const closeModal = () => {
    setModal(null);
    setForm({});
    setActionError(null);
  };

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    setActionError(null);
    try {
      if (modal.edit) {
        const id = (modal.edit as { id: string }).id;
        const url =
          modal.type === 'exam'
            ? `/api/super-admin/exam-content/exams/${id}`
            : modal.type === 'section'
              ? `/api/super-admin/exam-content/sections/${id}`
              : modal.type === 'subject'
                ? `/api/super-admin/exam-content/subjects/${id}`
                : `/api/super-admin/exam-content/topics/${id}`;
        const body: Record<string, unknown> = {};
        if (modal.type === 'exam') {
          body.name = form.name;
          body.code = form.code;
          body.description = form.description || null;
          if (form.status) body.status = form.status;
        } else {
          body.name = form.name;
          body.code = form.code;
          body.description = form.description || null;
          body.order = typeof form.order === 'number' ? form.order : 0;
          if (modal.type === 'topic' && form.examQuestionCount !== '' && form.examQuestionCount !== undefined) {
            body.examQuestionCount = typeof form.examQuestionCount === 'number' ? form.examQuestionCount : parseInt(String(form.examQuestionCount), 10) || null;
          }
        }
        const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Güncellenemedi');
      } else {
        const url =
          modal.type === 'exam'
            ? '/api/super-admin/exam-content/exams'
            : modal.type === 'section'
              ? '/api/super-admin/exam-content/sections'
              : modal.type === 'subject'
                ? '/api/super-admin/exam-content/subjects'
                : '/api/super-admin/exam-content/topics';
        const body: Record<string, unknown> = {
          name: form.name,
          code: form.code,
          description: form.description || null,
          order: typeof form.order === 'number' ? form.order : 0,
        };
        if (modal.type === 'exam') {
          body.status = form.status || 'ACTIVE';
        } else if (modal.type === 'section') {
          body.examId = modal.parentId;
        } else if (modal.type === 'subject') {
          body.sectionId = modal.parentId;
        } else if (modal.type === 'topic') {
          body.subjectId = modal.parentId;
          body.examQuestionCount = form.examQuestionCount !== '' && form.examQuestionCount !== undefined ? (typeof form.examQuestionCount === 'number' ? form.examQuestionCount : parseInt(String(form.examQuestionCount), 10)) : null;
        }
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Oluşturulamadı');
      }
      closeModal();
      await fetchTree();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'İşlem başarısız.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (type: EntityType, id: string) => {
    if (!confirm('Silmek istediğinize emin misiniz? Alt öğeler de etkilenebilir.')) return;
    setDeletingId(id);
    setActionError(null);
    try {
      const url =
        type === 'exam'
          ? `/api/super-admin/exam-content/exams/${id}`
          : type === 'section'
            ? `/api/super-admin/exam-content/sections/${id}`
            : type === 'subject'
              ? `/api/super-admin/exam-content/subjects/${id}`
              : `/api/super-admin/exam-content/topics/${id}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Silinemedi');
      await fetchTree();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Silinemedi.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderModal = () => {
    if (!modal) return null;
    const title =
      modal.edit
        ? (modal.type === 'exam' ? 'Sınav düzenle' : modal.type === 'section' ? 'Bölüm düzenle' : modal.type === 'subject' ? 'Ders düzenle' : 'Konu düzenle')
        : (modal.type === 'exam' ? 'Yeni sınav' : modal.type === 'section' ? 'Yeni bölüm' : modal.type === 'subject' ? 'Yeni ders' : 'Yeni konu');
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
          {actionError && <p className="text-sm text-red-600 mb-2">{actionError}</p>}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ad</label>
              <input
                type="text"
                value={String(form.name ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Kod</label>
              <input
                type="text"
                value={String(form.code ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder={modal.type === 'exam' ? 'KPSS' : 'örn: MAT'}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Açıklama (opsiyonel)</label>
              <input
                type="text"
                value={String(form.description ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            {modal.type === 'exam' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Durum</label>
                <select
                  value={String(form.status ?? 'ACTIVE')}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="INACTIVE">Pasif</option>
                  <option value="ARCHIVED">Arşiv</option>
                </select>
              </div>
            )}
            {(modal.type === 'section' || modal.type === 'subject' || modal.type === 'topic') && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sıra</label>
                <input
                  type="number"
                  min={0}
                  value={Number(form.order ?? 0)}
                  onChange={(e) => setForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            )}
            {modal.type === 'topic' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Soru dağılımı (sınavda kaç soru)</label>
                <input
                  type="number"
                  min={0}
                  value={form.examQuestionCount === '' || form.examQuestionCount == null ? '' : form.examQuestionCount}
                  onChange={(e) => setForm((f) => ({ ...f, examQuestionCount: e.target.value === '' ? '' : parseInt(e.target.value, 10) }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Boş bırakılabilir"
                />
              </div>
            )}
          </div>
          <div className="mt-6 flex gap-2 justify-end">
            <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              İptal
            </button>
            <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {modal.edit ? 'Kaydet' : 'Ekle'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard/super-admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Super Admin</span>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Sınav & İçerik Yönetimi</h1>
            <div className="w-28" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {actionError && !modal && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {actionError}
            <button type="button" onClick={() => setActionError(null)} className="ml-2 underline">Kapat</button>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">Sınav → Bölüm → Ders → Konu ağacını buradan yönetin.</p>
          <button
            type="button"
            onClick={() => openAdd('exam')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Yeni sınav
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        ) : exams.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
            Henüz sınav yok. &quot;Yeni sınav&quot; ile ekleyin.
          </div>
        ) : (
          <div className="space-y-1 rounded-xl border border-gray-200 bg-white overflow-hidden">
            {exams.map((exam) => (
              <div key={exam.id} className="border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-2 bg-gray-50/80 px-4 py-3">
                  <button type="button" onClick={() => toggleExam(exam.id)} className="p-0.5 hover:bg-gray-200 rounded">
                    {expandedExam.has(exam.id) ? <ChevronDown className="h-4 w-4 text-gray-600" /> : <ChevronRight className="h-4 w-4 text-gray-600" />}
                  </button>
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  <span className="font-semibold text-gray-900">{exam.name}</span>
                  <span className="text-xs text-gray-500">({exam.code})</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${exam.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{exam.status}</span>
                  <div className="ml-auto flex items-center gap-1">
                    <button type="button" onClick={() => openEdit('exam', exam)} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Düzenle"><Pencil className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => remove('exam', exam.id)} disabled={deletingId === exam.id} className="p-1.5 rounded hover:bg-red-100 text-red-600 disabled:opacity-50" title="Sil"><Trash2 className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => openAdd('section', exam.id)} className="p-1.5 rounded hover:bg-indigo-100 text-indigo-600" title="Bölüm ekle"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                {expandedExam.has(exam.id) && (
                  <div className="pl-8 pr-4 pb-2">
                    {exam.sections.length === 0 ? (
                      <p className="text-xs text-gray-500 py-2">Bölüm yok. + ile ekleyin.</p>
                    ) : (
                      exam.sections.map((section) => (
                        <div key={section.id} className="mt-2 rounded-lg border border-gray-200 bg-white">
                          <div className="flex items-center gap-2 px-3 py-2">
                            <button type="button" onClick={() => toggleSection(section.id)} className="p-0.5 hover:bg-gray-100 rounded">
                              {expandedSection.has(section.id) ? <ChevronDown className="h-3.5 w-3.5 text-gray-500" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-500" />}
                            </button>
                            <Layers className="h-3.5 w-3.5 text-amber-600" />
                            <span className="text-sm font-medium text-gray-800">{section.name}</span>
                            <span className="text-xs text-gray-400">({section.code})</span>
                            <div className="ml-auto flex items-center gap-1">
                              <button type="button" onClick={() => openEdit('section', section)} className="p-1 rounded hover:bg-gray-100 text-gray-500" title="Düzenle"><Pencil className="h-3 w-3" /></button>
                              <button type="button" onClick={() => remove('section', section.id)} disabled={deletingId === section.id} className="p-1 rounded hover:bg-red-100 text-red-500" title="Sil"><Trash2 className="h-3 w-3" /></button>
                              <button type="button" onClick={() => openAdd('subject', section.id)} className="p-1 rounded hover:bg-indigo-100 text-indigo-600" title="Ders ekle"><Plus className="h-3 w-3" /></button>
                            </div>
                          </div>
                          {expandedSection.has(section.id) && (
                            <div className="pl-6 pr-2 pb-2">
                              {section.subjects.length === 0 ? (
                                <p className="text-xs text-gray-500 py-1">Ders yok. + ile ekleyin.</p>
                              ) : (
                                section.subjects.map((subject) => (
                                  <div key={subject.id} className="mt-1 rounded border border-gray-100 bg-gray-50/50">
                                    <div className="flex items-center gap-2 px-2 py-1.5">
                                      <button type="button" onClick={() => toggleSubject(subject.id)} className="p-0.5 hover:bg-gray-200 rounded">
                                        {expandedSubject.has(subject.id) ? <ChevronDown className="h-3 w-3 text-gray-500" /> : <ChevronRight className="h-3 w-3 text-gray-500" />}
                                      </button>
                                      <FileText className="h-3 w-3 text-green-600" />
                                      <span className="text-xs font-medium text-gray-700">{subject.name}</span>
                                      <span className="text-xs text-gray-400">({subject.code})</span>
                                      <div className="ml-auto flex items-center gap-0.5">
                                        <button type="button" onClick={() => openEdit('subject', subject)} className="p-1 rounded hover:bg-gray-200 text-gray-500" title="Düzenle"><Pencil className="h-3 w-3" /></button>
                                        <button type="button" onClick={() => remove('subject', subject.id)} disabled={deletingId === subject.id} className="p-1 rounded hover:bg-red-100 text-red-500" title="Sil"><Trash2 className="h-3 w-3" /></button>
                                        <button type="button" onClick={() => openAdd('topic', subject.id)} className="p-1 rounded hover:bg-indigo-100 text-indigo-600" title="Konu ekle"><Plus className="h-3 w-3" /></button>
                                      </div>
                                    </div>
                                    {expandedSubject.has(subject.id) && (
                                      <div className="pl-5 pr-2 pb-1">
                                        {subject.topics.length === 0 ? (
                                          <p className="text-xs text-gray-400 py-1">Konu yok. + ile ekleyin.</p>
                                        ) : (
                                          subject.topics.map((topic) => (
                                            <div key={topic.id} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-100/80">
                                              <FolderOpen className="h-3 w-3 text-gray-400" />
                                              <span className="text-xs text-gray-700">{topic.name}</span>
                                              <span className="text-xs text-gray-400">({topic.code})</span>
                                              {topic.examQuestionCount != null && <span className="text-xs text-indigo-600">{topic.examQuestionCount} soru</span>}
                                              <div className="ml-auto flex items-center gap-0.5">
                                                <button type="button" onClick={() => openEdit('topic', topic)} className="p-0.5 rounded hover:bg-gray-200 text-gray-500" title="Düzenle"><Pencil className="h-3 w-3" /></button>
                                                <button type="button" onClick={() => remove('topic', topic.id)} disabled={deletingId === topic.id} className="p-0.5 rounded hover:bg-red-100 text-red-500" title="Sil"><Trash2 className="h-3 w-3" /></button>
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
