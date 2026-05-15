/**
 * Deneme Takibi sayfası — Deneme sınavı girişleri listesi ve yeni kayıt
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef, startTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Plus, TrendingUp, Calendar, Clock, Target, Calculator, BarChart3, TrendingDown, Minus } from 'lucide-react';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';
import { calculateFromBreakdown, calculateKpssFromBreakdown } from '@/lib/utils/denemeScore';
import type { KpssPopulationStats } from '@/lib/utils/denemeScore';
import { getMaxScoreForExam } from '@/lib/constants/examScoreRanges';
import {
  fetchDenemeAttempts,
  fetchDenemeSiteFlags,
  loadDenemeFormBootstrap,
  fetchExamStructure,
  fetchKpssDenemeStats,
  postDenemeAttempt,
} from '@/lib/client-api/denemeClient';

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
  const [sections, setSections] = useState<Array<{ id: string; code: string; subjects: { id: string }[] }>>([]);
  const [kpssStats, setKpssStats] = useState<KpssPopulationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  /** Super admin site ayarı: kapalıyken analiz + yeni kayıt formu gizli (sadece liste). */
  const [denemeAdvanced, setDenemeAdvanced] = useState<boolean | null>(null);
  const attemptsFetchInFlightRef = useRef(false);
  const lastAttemptsFetchAtRef = useRef(0);
  const structureCacheRef = useRef(
    new Map<string, { subjects: SubjectRow[]; sections: Array<{ id: string; code: string; subjects: { id: string }[] }> }>()
  );

  const [form, setForm] = useState({
    examId: '',
    attemptedAt: new Date().toISOString().slice(0, 16),
    durationMinutes: '',
    notes: '',
    simpleRight: '',
    simpleWrong: '',
    simpleEmpty: '',
  });

  const fetchAttempts = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastAttemptsFetchAtRef.current < 10000) return;
    if (attemptsFetchInFlightRef.current) return;
    attemptsFetchInFlightRef.current = true;
    try {
      const list = await fetchDenemeAttempts(50);
      if (list != null) {
        startTransition(() => setAttempts(list as DenemeItem[]));
        lastAttemptsFetchAtRef.current = Date.now();
      }
    } catch (e) {
      console.error(e);
    } finally {
      attemptsFetchInFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  useEffect(() => {
    fetchDenemeSiteFlags()
      .then((advanced) => {
        startTransition(() => setDenemeAdvanced(advanced));
      })
      .catch(() => startTransition(() => setDenemeAdvanced(false)));
  }, []);

  // Sınav listesi ve kullanıcının kayıtlı olduğu (aktif) sınav (gelişmiş form açıkken)
  useEffect(() => {
    if (!denemeAdvanced) return;
    loadDenemeFormBootstrap()
      .then(({ exams, activeExamId }) => {
        startTransition(() => {
          setExams(exams);
          if (activeExamId) setActiveExamId(activeExamId);
        });
      })
      .catch(() => {});
  }, [denemeAdvanced]);

  // Form açıldığında kayıtlı dersi otomatik seç
  useEffect(() => {
    if (!denemeAdvanced) return;
    if (showForm && activeExamId && form.examId === '') {
      setForm((f) => ({ ...f, examId: activeExamId }));
    }
  }, [denemeAdvanced, showForm, activeExamId, form.examId]);

  // Sınav seçilince ders yapısını yükle
  useEffect(() => {
    if (!denemeAdvanced) return;
    if (!form.examId) {
      setExamSubjects([]);
      setSubjectInputs({});
      return;
    }
    const cached = structureCacheRef.current.get(form.examId);
    if (cached) {
      setExamSubjects(cached.subjects);
      setSections(cached.sections);
      const initial: Record<string, SubjectInput> = {};
      cached.subjects.forEach((s: SubjectRow) => {
        initial[s.id] = { right: 0, wrong: 0, empty: 0 };
      });
      setSubjectInputs(initial);
      return;
    }
    setStructureLoading(true);
    setSections([]);
    setKpssStats(null);
    fetchExamStructure(form.examId)
      .then((raw) => {
        const json = raw as {
          success?: boolean;
          data?: {
            subjects?: SubjectRow[];
            sections?: Array<{ id: string; code: string; subjects: { id: string }[] }>;
          };
        };
        if (json.success && json.data?.subjects?.length) {
          setExamSubjects(json.data.subjects);
          setSections(json.data.sections ?? []);
          structureCacheRef.current.set(form.examId, {
            subjects: json.data.subjects,
            sections: json.data.sections ?? [],
          });
          const initial: Record<string, SubjectInput> = {};
          json.data.subjects.forEach((s: SubjectRow) => {
            initial[s.id] = { right: 0, wrong: 0, empty: 0 };
          });
          setSubjectInputs(initial);
        } else {
          setExamSubjects([]);
          setSections([]);
          setSubjectInputs({});
        }
      })
      .catch(() => {
        setExamSubjects([]);
        setSections([]);
        setSubjectInputs({});
      })
      .finally(() => setStructureLoading(false));
  }, [denemeAdvanced, form.examId]);

  const selectedExamCode = exams.find((e) => e.id === form.examId)?.code ?? '';

  // KPSS seçiliyse GY/GK ortalama ve standart sapma al
  useEffect(() => {
    if (!denemeAdvanced) return;
    if (selectedExamCode !== 'KPSS' || sections.length === 0) return;
    fetchKpssDenemeStats()
      .then((raw) => {
        const json = raw as { success?: boolean; data?: KpssPopulationStats };
        if (json.success && json.data) setKpssStats(json.data);
      })
      .catch(() => {});
  }, [denemeAdvanced, selectedExamCode, sections.length]);

  useEffect(() => {
    if (denemeAdvanced === false) {
      setShowForm(false);
    }
  }, [denemeAdvanced]);

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

  const maxScore = getMaxScoreForExam(selectedExamCode);

  const calculated = useMemo(() => {
    if (breakdownForSubmit.length === 0) return null;
    return calculateFromBreakdown(breakdownForSubmit, { maxScore });
  }, [breakdownForSubmit, maxScore]);

  const sectionSubjectIds = useMemo(() => {
    const gy = sections.find((s) => s.code === 'GENEL_YETENEK');
    const gk = sections.find((s) => s.code === 'GENEL_KULTUR');
    if (!gy || !gk) return null;
    return {
      GY: gy.subjects.map((s) => s.id),
      GK: gk.subjects.map((s) => s.id),
    };
  }, [sections]);

  const kpssCalculated = useMemo(() => {
    if (selectedExamCode !== 'KPSS' || !calculated || !sectionSubjectIds) return null;
    return calculateKpssFromBreakdown({
      breakdownWithNet: calculated.breakdownWithNet,
      sectionSubjectIds,
      stats: kpssStats,
    });
  }, [selectedExamCode, calculated, sectionSubjectIds, kpssStats]);

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
      const { ok, data } = await postDenemeAttempt(body);
      if (ok) {
        setMessage({ type: 'success', text: 'Deneme kaydı eklendi.' });
        setForm({ examId: '', attemptedAt: new Date().toISOString().slice(0, 16), durationMinutes: '', notes: '', simpleRight: '', simpleWrong: '', simpleEmpty: '' });
        setExamSubjects([]);
        setSubjectInputs({});
        setShowForm(false);
        fetchAttempts(true);
      } else {
        const d = data as { error?: string | { message?: string } };
        const errMsg =
          typeof d.error === 'string'
            ? d.error
            : d.error &&
                typeof d.error === 'object' &&
                'message' in d.error
              ? String((d.error as { message: string }).message)
              : 'Kayıt eklenemedi.';
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

  // Analiz: attempts üzerinden hesaplanan özet ve grafik verisi
  const analysis = useMemo(() => {
    const withNet = attempts.filter((a) => a.netScore != null) as Array<DenemeItem & { netScore: number }>;
    if (withNet.length === 0) {
      return null;
    }
    const nets = withNet.map((a) => a.netScore);
    const sum = nets.reduce((s, n) => s + n, 0);
    const avg = sum / nets.length;
    const max = Math.max(...nets);
    const min = Math.min(...nets);
    const sortedByDate = [...withNet].sort(
      (a, b) => new Date(a.attemptedAt).getTime() - new Date(b.attemptedAt).getTime()
    );
    const last5 = sortedByDate.slice(-5);
    const prev5 = sortedByDate.slice(-10, -5);
    const avgLast5 = last5.length ? last5.reduce((s, a) => s + a.netScore, 0) / last5.length : null;
    const avgPrev5 = prev5.length ? prev5.reduce((s, a) => s + a.netScore, 0) / prev5.length : null;
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (avgLast5 != null && avgPrev5 != null) {
      const diff = avgLast5 - avgPrev5;
      if (diff > 0.5) trend = 'up';
      else if (diff < -0.5) trend = 'down';
    }
    const chartData = sortedByDate.slice(-20).map((a) => ({
      attemptedAt: a.attemptedAt,
      netScore: a.netScore,
      examName: a.exam.name,
    }));
    const chartMin = Math.min(...chartData.map((d) => d.netScore));
    const chartMax = Math.max(...chartData.map((d) => d.netScore));
    const chartRange = chartMax - chartMin || 1;
    return {
      total: withNet.length,
      avg,
      max,
      min,
      avgLast5,
      avgPrev5,
      trend,
      chartData,
      chartMin,
      chartRange,
    };
  }, [attempts]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="border-b border-stone-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-stone-700 transition-colors hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Geri</span>
            </Link>
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <span className="text-xl font-bold text-stone-900 dark:text-stone-100">Deneme Takibi</span>
            </div>
            <div className="flex w-20 justify-end">
              <ThemeToggleCompact />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {message && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 ${
              message.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-200'
                : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {denemeAdvanced === false && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-medium">Gelişmiş deneme özellikleri şu an kapalı.</p>
            <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
              Deneme analizi ve yeni kayıt formu şu an kullanılamıyor. Bu özellikler etkinleştirildiğinde burada görünecek.
            </p>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Deneme kayıtlarım</h1>
          {denemeAdvanced && (
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 font-medium text-white hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Yeni deneme ekle
            </button>
          )}
        </div>

        {!loading && denemeAdvanced && analysis && (
          <section className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-stone-100">
              <BarChart3 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              Deneme analizi
            </h2>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-stone-100 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/60">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">Toplam deneme</p>
                <p className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">{analysis.total}</p>
              </div>
              <div className="rounded-xl border border-stone-100 bg-primary-50 p-4 dark:border-primary-900/40 dark:bg-primary-950/30">
                <p className="text-xs font-medium uppercase tracking-wide text-primary-700 dark:text-primary-300">Ortalama net</p>
                <p className="mt-1 text-2xl font-bold text-primary-800 dark:text-primary-200">{analysis.avg.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border border-stone-100 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">En yüksek net</p>
                <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-200">{analysis.max.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border border-stone-100 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">En düşük net</p>
                <p className="mt-1 text-2xl font-bold text-amber-800 dark:text-amber-200">{analysis.min.toFixed(2)}</p>
              </div>
            </div>
            {analysis.avgLast5 != null && analysis.avgPrev5 != null && (
              <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-stone-100 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-800/60">
                <span className="text-sm text-stone-600 dark:text-stone-400">Trend:</span>
                <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                  Son 5 deneme ort. <strong>{analysis.avgLast5.toFixed(2)}</strong> net
                </span>
                <span className="text-stone-400 dark:text-stone-600">·</span>
                <span className="text-sm text-stone-600 dark:text-stone-400">Önceki 5 deneme ort. {analysis.avgPrev5.toFixed(2)} net</span>
                {analysis.trend === 'up' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-sm font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                    <TrendingUp className="h-4 w-4" /> Artış
                  </span>
                )}
                {analysis.trend === 'down' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                    <TrendingDown className="h-4 w-4" /> Düşüş
                  </span>
                )}
                {analysis.trend === 'stable' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2.5 py-0.5 text-sm font-medium text-stone-700 dark:bg-stone-700 dark:text-stone-200">
                    <Minus className="h-4 w-4" /> Benzer seviye
                  </span>
                )}
              </div>
            )}
            {analysis.chartData.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-300">Net puan grafiği (son {analysis.chartData.length} deneme)</p>
                <div className="flex h-40 items-end gap-1">
                  {analysis.chartData.map((d, i) => {
                    const h = Math.max(8, ((d.netScore - analysis.chartMin) / analysis.chartRange) * 100);
                    return (
                      <div
                        key={`${d.attemptedAt}-${i}`}
                        className="flex min-w-0 flex-1 flex-col justify-end rounded-t bg-primary-200 transition-colors hover:bg-primary-400 dark:bg-primary-800 dark:hover:bg-primary-600"
                        style={{ height: `${Math.min(100, h)}%` }}
                        title={`${new Date(d.attemptedAt).toLocaleDateString('tr-TR')} · ${d.examName}: ${d.netScore.toFixed(2)} net`}
                      >
                        <span className="sr-only">{new Date(d.attemptedAt).toLocaleDateString('tr-TR')} {d.netScore.toFixed(2)} net</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-stone-500 dark:text-stone-400">
                  <span>{analysis.chartData.length > 0 ? new Date(analysis.chartData[0].attemptedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : ''}</span>
                  <span>{analysis.chartData.length > 0 ? new Date(analysis.chartData[analysis.chartData.length - 1].attemptedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : ''}</span>
                </div>
              </div>
            )}
          </section>
        )}

        {denemeAdvanced && showForm && (
          <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-stone-100">
              <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              Yeni deneme kaydı
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Sınav *</label>
                <select
                  required
                  value={form.examId}
                  onChange={(e) => setForm((f) => ({ ...f, examId: e.target.value }))}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
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
                <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Deneme tarihi</label>
                <input
                  type="datetime-local"
                  value={form.attemptedAt}
                  onChange={(e) => setForm((f) => ({ ...f, attemptedAt: e.target.value }))}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Süre (dakika)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Örn. 120"
                  value={form.durationMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
            </div>

            {form.examId && (
              <>
                {structureLoading ? (
                  <div className="mt-4 text-sm text-stone-500 dark:text-stone-400">Ders yapısı yükleniyor...</div>
                ) : examSubjects.length > 0 ? (
                  <div className="mt-6 overflow-x-auto">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-300">
                      <Calculator className="h-4 w-4" />
                      Ders ders doğru / yanlış / boş (net otomatik: Doğru - Yanlış/4)
                    </h3>
                    <table className="w-full min-w-[400px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/80">
                          <th className="p-2 text-left font-medium text-stone-700 dark:text-stone-300">Ders</th>
                          <th className="w-20 p-2 text-center font-medium text-stone-700 dark:text-stone-300">Doğru</th>
                          <th className="w-20 p-2 text-center font-medium text-stone-700 dark:text-stone-300">Yanlış</th>
                          <th className="w-20 p-2 text-center font-medium text-stone-700 dark:text-stone-300">Boş</th>
                          <th className="w-24 p-2 text-center font-medium text-stone-700 dark:text-stone-300">Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examSubjects.map((s) => {
                          const inp = subjectInputs[s.id] ?? { right: 0, wrong: 0, empty: 0 };
                          const net = inp.right - inp.wrong / 4;
                          return (
                            <tr key={s.id} className="border-b border-stone-100 dark:border-stone-800">
                              <td className="p-2 font-medium text-stone-900 dark:text-stone-100">{s.name}</td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="0"
                                  className="w-full rounded border border-stone-300 bg-white px-2 py-1 text-center text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                                  value={inp.right || ''}
                                  onChange={(e) => updateSubjectInput(s.id, 'right', parseInt(e.target.value, 10) || 0)}
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="0"
                                  className="w-full rounded border border-stone-300 bg-white px-2 py-1 text-center text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                                  value={inp.wrong || ''}
                                  onChange={(e) => updateSubjectInput(s.id, 'wrong', parseInt(e.target.value, 10) || 0)}
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="0"
                                  className="w-full rounded border border-stone-300 bg-white px-2 py-1 text-center text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                                  value={inp.empty || ''}
                                  onChange={(e) => updateSubjectInput(s.id, 'empty', parseInt(e.target.value, 10) || 0)}
                                />
                              </td>
                              <td className="p-2 text-center font-medium text-primary-600">
                                {net.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                        {calculated && (
                          <tr className="border-t-2 border-stone-300 bg-stone-50 font-semibold dark:border-stone-600 dark:bg-stone-800/80">
                            <td className="p-2 text-stone-900 dark:text-stone-100">Toplam</td>
                            <td className="p-2 text-center">{calculated.totalRight}</td>
                            <td className="p-2 text-center">{calculated.totalWrong}</td>
                            <td className="p-2 text-center">{calculated.totalEmpty}</td>
                            <td className="p-2 text-center text-primary-700">{calculated.totalNet.toFixed(2)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    {kpssCalculated ? (
                      <div className="mt-3 space-y-2 rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-900/40 dark:bg-primary-950/30">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary-800 dark:text-primary-200">KPSS puan hesaplama (net → z → SP → P1/P2/P3)</p>
                        <div className="grid gap-2 text-sm sm:grid-cols-2">
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <span className="text-stone-600 dark:text-stone-400">GY net: <strong className="text-stone-900 dark:text-stone-100">{kpssCalculated.gyNet.toFixed(2)}</strong></span>
                            <span className="text-stone-600 dark:text-stone-400">GK net: <strong className="text-stone-900 dark:text-stone-100">{kpssCalculated.gkNet.toFixed(2)}</strong></span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <span className="text-stone-600 dark:text-stone-400">GY SP: <strong className="text-primary-700 dark:text-primary-300">{kpssCalculated.gySP.toFixed(2)}</strong></span>
                            <span className="text-stone-600 dark:text-stone-400">GK SP: <strong className="text-primary-700 dark:text-primary-300">{kpssCalculated.gkSP.toFixed(2)}</strong></span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 pt-1">
                          <span className="font-medium text-stone-700 dark:text-stone-300">P1 (70% GY + 30% GK): <strong className="text-primary-800 dark:text-primary-200">{kpssCalculated.P1.toFixed(2)}</strong></span>
                          <span className="font-medium text-stone-700 dark:text-stone-300">P2 (60% GY + 40% GK): <strong className="text-primary-800 dark:text-primary-200">{kpssCalculated.P2.toFixed(2)}</strong></span>
                          <span className="font-medium text-stone-700 dark:text-stone-300">P3 (50% GY + 50% GK): <strong className="text-primary-800 dark:text-primary-200">{kpssCalculated.P3.toFixed(2)}</strong></span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Kayıtta toplam puan olarak P3 kullanılır. Ortalama ve σ veritabanındaki tüm KPSS denemelerinden hesaplanır.</p>
                      </div>
                    ) : calculated && (
                      <div className="mt-3 flex flex-wrap gap-4 rounded-lg bg-primary-50 p-3 dark:bg-primary-950/30">
                        <span className="font-medium text-stone-700 dark:text-stone-300">Toplam net: <strong className="text-primary-700 dark:text-primary-300">{calculated.totalNet.toFixed(2)}</strong></span>
                        <span className="font-medium text-stone-700 dark:text-stone-300">Hesaplanan puan: <strong className="text-primary-700 dark:text-primary-300">{calculated.calculatedScore.toFixed(2)}{maxScore !== 100 ? ` / ${maxScore}` : ''}</strong></span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
                    <p className="text-sm text-amber-800 dark:text-amber-200">Bu sınav için ders yapısı tanımlı değil. Toplam doğru / yanlış / boş girin; net ve puan otomatik hesaplanır.</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-stone-700 dark:text-stone-300">Toplam Doğru</label>
                        <input
                          type="number"
                          min="0"
                          value={form.simpleRight}
                          onChange={(e) => setForm((f) => ({ ...f, simpleRight: e.target.value }))}
                          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-stone-700 dark:text-stone-300">Toplam Yanlış</label>
                        <input
                          type="number"
                          min="0"
                          value={form.simpleWrong}
                          onChange={(e) => setForm((f) => ({ ...f, simpleWrong: e.target.value }))}
                          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-stone-700 dark:text-stone-300">Toplam Boş</label>
                        <input
                          type="number"
                          min="0"
                          value={form.simpleEmpty}
                          onChange={(e) => setForm((f) => ({ ...f, simpleEmpty: e.target.value }))}
                          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Not (opsiyonel)</label>
              <textarea
                rows={2}
                maxLength={500}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
                placeholder="Örn. 1. deneme..."
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                disabled={submitting || !!(form.examId && examSubjects.length > 0 && !calculated?.totalQuestions)}
                className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-stone-300 px-4 py-2 font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                İptal
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
            ))}
          </div>
        ) : attempts.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center dark:border-stone-800 dark:bg-stone-900/90">
            <TrendingUp className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-600" />
            <p className="mt-4 text-stone-600 dark:text-stone-400">Henüz deneme kaydı yok.</p>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-500">Yukarıdaki &quot;Yeni deneme ekle&quot; ile ilk kaydınızı girebilirsiniz.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {attempts.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/90"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <span className="font-medium text-stone-900 dark:text-stone-100">{formatDate(a.attemptedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-stone-500 dark:text-stone-400" />
                  <span className="text-stone-700 dark:text-stone-300">
                    {a.exam.name} ({a.exam.code})
                  </span>
                </div>
                {a.totalScore != null && (
                  <div className="flex items-center gap-1 rounded-lg bg-primary-50 px-2 py-1 dark:bg-primary-950/40">
                    <Target className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    <span className="font-semibold text-primary-700 dark:text-primary-300">{a.totalScore} puan</span>
                  </div>
                )}
                {a.netScore != null && (
                  <span className="text-sm text-stone-600 dark:text-stone-400">Net: {a.netScore}</span>
                )}
                {denemeAdvanced && (a.rightCount != null || a.wrongCount != null) && (
                  <span className="text-sm text-stone-500 dark:text-stone-400">
                    D: {a.rightCount ?? '-'} / Y: {a.wrongCount ?? '-'}
                    {a.emptyCount != null ? ` / B: ${a.emptyCount}` : ''}
                  </span>
                )}
                {denemeAdvanced && a.durationMinutes != null && (
                  <span className="flex items-center gap-1 text-sm text-stone-500">
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
