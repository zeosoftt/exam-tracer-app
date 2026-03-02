/**
 * Deneme Takibi sayfası — Deneme sınavı girişleri listesi ve yeni kayıt
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Plus, TrendingUp, Calendar, Clock, Target, Calculator } from 'lucide-react';
import { calculateFromBreakdown } from '@/lib/utils/denemeScore';
import { getMaxScoreForExam } from '@/lib/constants/examScoreRanges';

interface ExamOption {
  id: string;
  name: string;
  code: string;
}

interface SubjectRow {
  id: string;
  name: string;
  code: string;
  sectionName?: string;
}

interface SubjectInput {
  right: number;
  wrong: number;
  empty: number;
}

interface DenemeItem {
  id: string;
  examId: string;
  exam: { id: string; name: string; code: string };
  attemptedAt: string;
  completedAt: string | null;
  totalScore: number | null;
  netScore: number | null;
  rightCount: number | null;
  wrongCount: number | null;
  emptyCount: number | null;
  durationMinutes: number | null;
  status: string;
  notes: string | null;
}

export default function DenemePage() {
  const [attempts, setAttempts] = useState<DenemeItem[]>([]);
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [examSubjects, setExamSubjects] = useState<SubjectRow[]>([]);
  const [subjectInputs, setSubjectInputs] = useState<Record<string, SubjectInput>>({});
  const [structureLoading, setStructureLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    examId: '',
    attemptedAt: new Date().toISOString().slice(0, 16),
    durationMinutes: '',
    notes: '',
    simpleRight: '',
    simpleWrong: '',
    simpleEmpty: '',
  });

  const fetchAttempts = useCallback(async () => {
    try {
      const res = await fetch('/api/deneme?limit=50');
      if (res.ok) {
        const json = await res.json();
        setAttempts(json.data ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  // Sınav listesi ve kullanıcının kayıtlı olduğu (aktif) sınav
  useEffect(() => {
    Promise.all([
      fetch('/api/exams/available').then((r) => r.json()),
      fetch('/api/user/settings').then((r) => r.json()),
    ])
      .then(([examsRes, settingsRes]) => {
        if (examsRes.success && Array.isArray(examsRes.data)) setExams(examsRes.data);
        if (settingsRes.success && settingsRes.data?.activeExam?.id) {
          setActiveExamId(settingsRes.data.activeExam.id);
        }
      })
      .catch(() => {});
  }, []);

  // Form açıldığında kayıtlı dersi otomatik seç
  useEffect(() => {
    if (showForm && activeExamId && form.examId === '') {
      setForm((f) => ({ ...f, examId: activeExamId }));
    }
  }, [showForm, activeExamId, form.examId]);

  // Sınav seçilince ders yapısını yükle
  useEffect(() => {
    if (!form.examId) {
      setExamSubjects([]);
      setSubjectInputs({});
      return;
    }
    setStructureLoading(true);
    fetch(`/api/exams/${form.examId}/structure`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.subjects?.length) {
          setExamSubjects(json.data.subjects);
          const initial: Record<string, SubjectInput> = {};
          json.data.subjects.forEach((s: SubjectRow) => {
            initial[s.id] = { right: 0, wrong: 0, empty: 0 };
          });
          setSubjectInputs(initial);
        } else {
          setExamSubjects([]);
          setSubjectInputs({});
        }
      })
      .catch(() => {
        setExamSubjects([]);
        setSubjectInputs({});
      })
      .finally(() => setStructureLoading(false));
  }, [form.examId]);

  const updateSubjectInput = (subjectId: string, field: 'right' | 'wrong' | 'empty', value: number) => {
    setSubjectInputs((prev) => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] ?? { right: 0, wrong: 0, empty: 0 }),
        [field]: Math.max(0, value),
      },
    }));
  };

  const breakdownForSubmit = useMemo(() => {
    return examSubjects.map((s) => ({
      subjectId: s.id,
      subjectName: s.name,
      right: subjectInputs[s.id]?.right ?? 0,
      wrong: subjectInputs[s.id]?.wrong ?? 0,
      empty: subjectInputs[s.id]?.empty ?? 0,
    }));
  }, [examSubjects, subjectInputs]);

  const selectedExamCode = exams.find((e) => e.id === form.examId)?.code ?? '';
  const maxScore = getMaxScoreForExam(selectedExamCode);

  const calculated = useMemo(() => {
    if (breakdownForSubmit.length === 0) return null;
    return calculateFromBreakdown(breakdownForSubmit, { maxScore });
  }, [breakdownForSubmit, maxScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!form.examId) {
      setMessage({ type: 'error', text: 'Sınav seçiniz.' });
      return;
    }
    const hasBreakdown = examSubjects.length > 0 && breakdownForSubmit.some(
      (b) => b.right > 0 || b.wrong > 0 || b.empty > 0
    );
    const hasSimple = examSubjects.length === 0 && (
      Number(form.simpleRight) > 0 || Number(form.simpleWrong) > 0 || Number(form.simpleEmpty) > 0
    );
    if (examSubjects.length > 0 && !hasBreakdown) {
      setMessage({ type: 'error', text: 'En az bir ders için doğru/yanlış/boş girin.' });
      return;
    }
    if (examSubjects.length === 0 && !hasSimple) {
      setMessage({ type: 'error', text: 'Toplam doğru/yanlış/boş girin veya sınav seçin.' });
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        examId: form.examId,
        attemptedAt: form.attemptedAt ? new Date(form.attemptedAt).toISOString() : undefined,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        notes: form.notes || undefined,
      };
      if (hasBreakdown) {
        body.breakdown = breakdownForSubmit;
      } else if (hasSimple) {
        body.rightCount = Number(form.simpleRight) || 0;
        body.wrongCount = Number(form.simpleWrong) || 0;
        body.emptyCount = Number(form.simpleEmpty) || 0;
      }
      const res = await fetch('/api/deneme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Deneme kaydı eklendi.' });
        setForm({ examId: '', attemptedAt: new Date().toISOString().slice(0, 16), durationMinutes: '', notes: '', simpleRight: '', simpleWrong: '', simpleEmpty: '' });
        setExamSubjects([]);
        setSubjectInputs({});
        setShowForm(false);
        fetchAttempts();
      } else {
        const errMsg = typeof data.error === 'string'
          ? data.error
          : (data.error && typeof data.error === 'object' && 'message' in data.error
            ? String((data.error as { message: string }).message)
            : 'Kayıt eklenemedi.');
        setMessage({ type: 'error', text: errMsg });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Bağlantı hatası.' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Geri</span>
            </Link>
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Deneme Takibi</span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {message && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Deneme kayıtlarım</h1>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Yeni deneme ekle
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Yeni deneme kaydı
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Sınav *</label>
                <select
                  required
                  value={form.examId}
                  onChange={(e) => setForm((f) => ({ ...f, examId: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Seçiniz</option>
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Deneme tarihi</label>
                <input
                  type="datetime-local"
                  value={form.attemptedAt}
                  onChange={(e) => setForm((f) => ({ ...f, attemptedAt: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Süre (dakika)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Örn. 120"
                  value={form.durationMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {form.examId && (
              <>
                {structureLoading ? (
                  <div className="mt-4 text-sm text-gray-500">Ders yapısı yükleniyor...</div>
                ) : examSubjects.length > 0 ? (
                  <div className="mt-6 overflow-x-auto">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Calculator className="h-4 w-4" />
                      Ders ders doğru / yanlış / boş (net otomatik: Doğru - Yanlış/4)
                    </h3>
                    <table className="w-full min-w-[400px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="p-2 text-left font-medium text-gray-700">Ders</th>
                          <th className="w-20 p-2 text-center font-medium text-gray-700">Doğru</th>
                          <th className="w-20 p-2 text-center font-medium text-gray-700">Yanlış</th>
                          <th className="w-20 p-2 text-center font-medium text-gray-700">Boş</th>
                          <th className="w-24 p-2 text-center font-medium text-gray-700">Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examSubjects.map((s) => {
                          const inp = subjectInputs[s.id] ?? { right: 0, wrong: 0, empty: 0 };
                          const net = inp.right - inp.wrong / 4;
                          return (
                            <tr key={s.id} className="border-b border-gray-100">
                              <td className="p-2 font-medium text-gray-900">{s.name}</td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="0"
                                  className="w-full rounded border border-gray-300 px-2 py-1 text-center"
                                  value={inp.right || ''}
                                  onChange={(e) => updateSubjectInput(s.id, 'right', parseInt(e.target.value, 10) || 0)}
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="0"
                                  className="w-full rounded border border-gray-300 px-2 py-1 text-center"
                                  value={inp.wrong || ''}
                                  onChange={(e) => updateSubjectInput(s.id, 'wrong', parseInt(e.target.value, 10) || 0)}
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="0"
                                  className="w-full rounded border border-gray-300 px-2 py-1 text-center"
                                  value={inp.empty || ''}
                                  onChange={(e) => updateSubjectInput(s.id, 'empty', parseInt(e.target.value, 10) || 0)}
                                />
                              </td>
                              <td className="p-2 text-center font-medium text-blue-600">
                                {net.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                        {calculated && (
                          <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                            <td className="p-2 text-gray-900">Toplam</td>
                            <td className="p-2 text-center">{calculated.totalRight}</td>
                            <td className="p-2 text-center">{calculated.totalWrong}</td>
                            <td className="p-2 text-center">{calculated.totalEmpty}</td>
                            <td className="p-2 text-center text-blue-700">{calculated.totalNet.toFixed(2)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    {calculated && (
                      <div className="mt-3 flex flex-wrap gap-4 rounded-lg bg-blue-50 p-3">
                        <span className="font-medium text-gray-700">Toplam net: <strong className="text-blue-700">{calculated.totalNet.toFixed(2)}</strong></span>
                        <span className="font-medium text-gray-700">Hesaplanan puan: <strong className="text-blue-700">{calculated.calculatedScore.toFixed(2)}{maxScore !== 100 ? ` / ${maxScore}` : ''}</strong></span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">Bu sınav için ders yapısı tanımlı değil. Toplam doğru / yanlış / boş girin; net ve puan otomatik hesaplanır.</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Toplam Doğru</label>
                        <input
                          type="number"
                          min="0"
                          value={form.simpleRight}
                          onChange={(e) => setForm((f) => ({ ...f, simpleRight: e.target.value }))}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Toplam Yanlış</label>
                        <input
                          type="number"
                          min="0"
                          value={form.simpleWrong}
                          onChange={(e) => setForm((f) => ({ ...f, simpleWrong: e.target.value }))}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-700">Toplam Boş</label>
                        <input
                          type="number"
                          min="0"
                          value={form.simpleEmpty}
                          onChange={(e) => setForm((f) => ({ ...f, simpleEmpty: e.target.value }))}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">Not (opsiyonel)</label>
              <textarea
                rows={2}
                maxLength={500}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Örn. 1. deneme..."
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                disabled={submitting || !!(form.examId && examSubjects.length > 0 && !calculated?.totalQuestions)}
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : attempts.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-600">Henüz deneme kaydı yok.</p>
            <p className="mt-1 text-sm text-gray-500">Yukarıdaki &quot;Yeni deneme ekle&quot; ile ilk kaydınızı girebilirsiniz.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {attempts.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">{formatDate(a.attemptedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    {a.exam.name} ({a.exam.code})
                  </span>
                </div>
                {a.totalScore != null && (
                  <div className="flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-700">{a.totalScore} puan</span>
                  </div>
                )}
                {a.netScore != null && (
                  <span className="text-sm text-gray-600">Net: {a.netScore}</span>
                )}
                {(a.rightCount != null || a.wrongCount != null) && (
                  <span className="text-sm text-gray-500">
                    D: {a.rightCount ?? '-'} / Y: {a.wrongCount ?? '-'}
                    {a.emptyCount != null ? ` / B: ${a.emptyCount}` : ''}
                  </span>
                )}
                {a.durationMinutes != null && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {a.durationMinutes} dk
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
