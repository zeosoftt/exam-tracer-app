'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { calculateExamScore } from '@/lib/scoring/calculateExamScore';
import type { KpssPopulationStats } from '@/lib/scoring';
import { getMaxScoreForExam } from '@/lib/constants/examScoreRanges';
import {
  fetchExamStructure,
  fetchKpssDenemeStats,
  postDenemeAttempt,
} from '@/lib/client-api/denemeClient';
import {
  createInitialDenemeForm,
  type DenemeFormState,
  type ExamOption,
  type SubjectInput,
  type SubjectRow,
} from '@/components/deneme/hooks/denemeFormTypes';

type UseDenemeFormOptions = {
  featuresEnabled: boolean;
  formModalOpen: boolean;
  exams: ExamOption[];
  activeExamId: string | null;
  onPremiumRequired: () => void;
  onSubmitSuccess: () => void;
};

export function useDenemeForm({
  featuresEnabled,
  formModalOpen,
  exams,
  activeExamId,
  onPremiumRequired,
  onSubmitSuccess,
}: UseDenemeFormOptions) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<DenemeFormState>(createInitialDenemeForm);
  const [examSubjects, setExamSubjects] = useState<SubjectRow[]>([]);
  const [subjectInputs, setSubjectInputs] = useState<Record<string, SubjectInput>>({});
  const [structureLoading, setStructureLoading] = useState(false);
  const [sections, setSections] = useState<Array<{ id: string; code: string; subjects: { id: string }[] }>>([]);
  const [kpssStats, setKpssStats] = useState<KpssPopulationStats | null>(null);

  const structureCacheRef = useRef(
    new Map<string, { subjects: SubjectRow[]; sections: Array<{ id: string; code: string; subjects: { id: string }[] }> }>(),
  );

  const closeFormModal = useCallback(() => {}, []);

  useEffect(() => {
    if (!featuresEnabled || !formModalOpen) {
      setMessage(null);
    }
  }, [featuresEnabled, formModalOpen]);

  useEffect(() => {
    if (!featuresEnabled) return;
    if (formModalOpen && activeExamId && form.examId === '') {
      setForm((f) => ({ ...f, examId: activeExamId }));
    }
  }, [featuresEnabled, formModalOpen, activeExamId, form.examId]);

  useEffect(() => {
    if (!featuresEnabled || !formModalOpen) return;
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
      cached.subjects.forEach((s) => {
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
          json.data.subjects.forEach((s) => {
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
  }, [featuresEnabled, formModalOpen, form.examId]);

  const selectedExamCode = exams.find((e) => e.id === form.examId)?.code ?? '';

  useEffect(() => {
    if (!featuresEnabled || !formModalOpen) return;
    if (selectedExamCode !== 'KPSS' || sections.length === 0) return;
    fetchKpssDenemeStats()
      .then((raw) => {
        const json = raw as { success?: boolean; data?: KpssPopulationStats };
        if (json.success && json.data) setKpssStats(json.data);
      })
      .catch(() => {});
  }, [featuresEnabled, formModalOpen, selectedExamCode, sections.length]);

  const updateSubjectInput = useCallback((subjectId: string, field: 'right' | 'wrong' | 'empty', value: number) => {
    setSubjectInputs((prev) => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] ?? { right: 0, wrong: 0, empty: 0 }),
        [field]: Math.max(0, value),
      },
    }));
  }, []);

  const breakdownForSubmit = useMemo(
    () =>
      examSubjects.map((s) => ({
        subjectId: s.id,
        subjectName: s.name,
        right: subjectInputs[s.id]?.right ?? 0,
        wrong: subjectInputs[s.id]?.wrong ?? 0,
        empty: subjectInputs[s.id]?.empty ?? 0,
      })),
    [examSubjects, subjectInputs],
  );

  const maxScore = getMaxScoreForExam(selectedExamCode);

  const populationStatsForScore = useMemo(() => {
    if (!kpssStats || !selectedExamCode.startsWith('KPSS')) return null;
    return {
      GY: { mean: kpssStats.gyMean, std: kpssStats.gyStd, sampleSize: kpssStats.sampleSize },
      GK: { mean: kpssStats.gkMean, std: kpssStats.gkStd, sampleSize: kpssStats.sampleSize },
    };
  }, [kpssStats, selectedExamCode]);

  const calculated = useMemo(() => {
    if (!formModalOpen || !selectedExamCode) return null;
    if (breakdownForSubmit.length > 0) {
      return calculateExamScore({
        examCode: selectedExamCode,
        breakdown: breakdownForSubmit,
        maxScore,
        sections,
        populationStats: populationStatsForScore,
      });
    }
    const sr = Number(form.simpleRight) || 0;
    const sw = Number(form.simpleWrong) || 0;
    const se = Number(form.simpleEmpty) || 0;
    if (sr + sw + se === 0) return null;
    return calculateExamScore({
      examCode: selectedExamCode,
      breakdown: [],
      maxScore,
      simpleTotals: { right: sr, wrong: sw, empty: se },
    });
  }, [
    formModalOpen,
    selectedExamCode,
    breakdownForSubmit,
    maxScore,
    sections,
    populationStatsForScore,
    form.simpleRight,
    form.simpleWrong,
    form.simpleEmpty,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!form.examId) {
      setMessage({ type: 'error', text: 'Sınav seçiniz.' });
      return;
    }

    const hasBreakdown =
      examSubjects.length > 0 &&
      breakdownForSubmit.some((b) => b.right > 0 || b.wrong > 0 || b.empty > 0);
    const hasSimple =
      examSubjects.length === 0 &&
      (Number(form.simpleRight) > 0 || Number(form.simpleWrong) > 0 || Number(form.simpleEmpty) > 0);

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

      const { ok, data, premiumRequired } = await postDenemeAttempt(body);
      if (premiumRequired) {
        onPremiumRequired();
        setMessage({ type: 'error', text: 'Deneme kaydı eklemek için Premium plan gerekir.' });
        return;
      }
      if (ok) {
        setMessage({ type: 'success', text: 'Deneme kaydı eklendi.' });
        setForm(createInitialDenemeForm());
        setExamSubjects([]);
        setSubjectInputs({});
        onSubmitSuccess();
      } else {
        const d = data as { error?: string | { message?: string } };
        const errMsg =
          typeof d.error === 'string'
            ? d.error
            : d.error && typeof d.error === 'object' && 'message' in d.error
              ? String((d.error as { message: string }).message)
              : 'Kayıt eklenemedi.';
        setMessage({ type: 'error', text: errMsg });
      }
    } catch {
      setMessage({ type: 'error', text: 'Bağlantı hatası.' });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    closeFormModal,
    message,
    submitting,
    form,
    setForm,
    examSubjects,
    subjectInputs,
    structureLoading,
    breakdownForSubmit,
    maxScore,
    calculated,
    updateSubjectInput,
    handleSubmit,
  };
}
