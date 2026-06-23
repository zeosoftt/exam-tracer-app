'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Link2, Loader2, Save } from 'lucide-react';
import { FlashMessage } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import {
  fetchInstitutionResultImport,
  saveInstitutionResultAsAttempt,
  type InstitutionResultImport,
} from '@/lib/client-api/denemeClient';
import { denemeCardClass } from '@/components/deneme/denemeUi';
import type { ExamOption } from '@/components/deneme/hooks/denemeFormTypes';

export type InstitutionImportOptions = {
  disabled?: boolean;
  exams?: ExamOption[];
  activeExamId?: string | null;
  onSaved?: () => void;
};

export type InstitutionImportViewModel = {
  url: string;
  setUrl: (url: string) => void;
  examId: string;
  setExamId: (examId: string) => void;
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveMessage: string | null;
  result: InstitutionResultImport | null;
  handleFetch: (event: React.FormEvent) => Promise<void>;
  handleSave: () => Promise<void>;
  disabled: boolean;
  exams: ExamOption[];
};

export function useInstitutionImport({
  disabled = false,
  exams = [],
  activeExamId,
  onSaved,
}: InstitutionImportOptions): InstitutionImportViewModel {
  const [url, setUrl] = useState('');
  const [examId, setExamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [result, setResult] = useState<InstitutionResultImport | null>(null);

  useEffect(() => {
    if (result && !examId && activeExamId) {
      setExamId(activeExamId);
    }
  }, [result, examId, activeExamId]);

  async function handleFetch(event: React.FormEvent) {
    event.preventDefault();
    if (disabled || !url.trim()) return;

    setLoading(true);
    setError(null);
    setSaveMessage(null);
    setResult(null);

    const response = await fetchInstitutionResultImport(url.trim());
    setLoading(false);

    if (!response.ok) {
      setError(response.error);
      return;
    }

    setResult(response.data);
    if (activeExamId) setExamId(activeExamId);
  }

  async function handleSave() {
    if (disabled || saving || !result || !examId || !url.trim()) return;

    setSaving(true);
    setError(null);
    setSaveMessage(null);

    const response = await saveInstitutionResultAsAttempt(url.trim(), examId);
    setSaving(false);

    if (!response.ok) {
      setError(response.error);
      return;
    }

    setSaveMessage('Deneme kaydı eklendi.');
    setUrl('');
    setResult(null);
    setExamId('');
    onSaved?.();
  }

  return {
    url,
    setUrl,
    examId,
    setExamId,
    loading,
    saving,
    error,
    saveMessage,
    result,
    handleFetch,
    handleSave,
    disabled,
    exams,
  };
}

export function InstitutionImportUrlField({ vm }: { vm: InstitutionImportViewModel }) {
  return (
    <input
      type="url"
      value={vm.url}
      onChange={(e) => vm.setUrl(e.target.value)}
      placeholder="https://sonuc.kurumadi.com/kpss/..."
      className="input min-w-0 w-full"
      disabled={vm.disabled || vm.loading || vm.saving}
      aria-labelledby="institution-import-heading"
    />
  );
}

export function InstitutionImportFetchButton({
  vm,
  className,
}: {
  vm: InstitutionImportViewModel;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={vm.disabled || vm.loading || vm.saving || !vm.url.trim()}
      className={cn('btn btn-primary shrink-0 gap-2', className)}
    >
      {vm.loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      Veriyi getir
    </button>
  );
}

export function InstitutionImportAlerts({ vm }: { vm: InstitutionImportViewModel }) {
  if (!vm.error && !vm.saveMessage) return null;

  return (
    <div className="mt-4 space-y-4">
      {vm.error ? (
        <FlashMessage type="error" variant="bordered">
          {vm.error}
        </FlashMessage>
      ) : null}
      {vm.saveMessage ? (
        <FlashMessage type="success" variant="bordered">
          {vm.saveMessage}
        </FlashMessage>
      ) : null}
    </div>
  );
}

export function InstitutionImportForm({ vm }: { vm: InstitutionImportViewModel }) {
  return (
    <>
      <form onSubmit={(e) => void vm.handleFetch(e)} className="flex flex-col gap-3 sm:flex-row">
        <InstitutionImportUrlField vm={vm} />
        <InstitutionImportFetchButton vm={vm} />
      </form>
      <InstitutionImportAlerts vm={vm} />
    </>
  );
}

export function InstitutionImportPreview({ vm }: { vm: InstitutionImportViewModel }) {
  const { result } = vm;
  if (!result) return null;

  return (
    <div className="mt-5 space-y-5 border-t border-stone-100 pt-5 dark:border-stone-800">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetaTile label="Sınav" value={result.examName} />
        <MetaTile label="Tarih" value={result.examDate ?? '—'} />
        <MetaTile label="Kurum" value={result.institution ?? '—'} />
        <MetaTile label="Toplam net" value={result.totals.net.toFixed(2)} />
      </div>
      <p className="text-xs text-stone-500 dark:text-stone-400">
        Kaynak: {result.sourceHost}
        {result.platform === 'verisayar' ? ' · Verisayar formatı' : null}
      </p>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-stone-800 dark:text-stone-200">Ders netleri</h3>
        <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-700">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="bg-stone-50 text-left dark:bg-stone-800/80">
                <th className="p-2.5 font-medium">Ders</th>
                <th className="p-2.5 text-center font-medium">Soru</th>
                <th className="p-2.5 text-center font-medium">D</th>
                <th className="p-2.5 text-center font-medium">Y</th>
                <th className="p-2.5 text-center font-medium">B</th>
                <th className="p-2.5 text-center font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {result.subjects.map((subject) => (
                <tr key={subject.name} className="border-t border-stone-100 dark:border-stone-800">
                  <td className="p-2.5 font-medium">{subject.name}</td>
                  <td className="p-2.5 text-center tabular-nums">{subject.questionCount}</td>
                  <td className="p-2.5 text-center tabular-nums">{subject.right}</td>
                  <td className="p-2.5 text-center tabular-nums">{subject.wrong}</td>
                  <td className="p-2.5 text-center tabular-nums">{subject.empty}</td>
                  <td className="p-2.5 text-center font-semibold tabular-nums text-primary-700 dark:text-primary-300">
                    {subject.net.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {result.scores.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-stone-800 dark:text-stone-200">Puan türleri</h3>
          <div className="flex flex-wrap gap-2">
            {result.scores.map((score) => (
              <span
                key={score.type}
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900/60"
              >
                <span className="font-medium text-stone-700 dark:text-stone-300">{score.type}</span>
                <span className="font-bold tabular-nums text-violet-700 dark:text-violet-300">
                  {score.score.toFixed(3)}
                </span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {result.topics.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-stone-800 dark:text-stone-200">
            Konu dağılımı ({result.topics.length} konu)
          </h3>
          <div className="custom-scrollbar max-h-64 overflow-y-auto rounded-xl border border-stone-200 dark:border-stone-700">
            <table className="w-full min-w-[640px] border-collapse text-xs">
              <thead className="sticky top-0 bg-stone-50 dark:bg-stone-900">
                <tr>
                  <th className="p-2 text-left font-medium">Ders</th>
                  <th className="p-2 text-left font-medium">Konu</th>
                  <th className="p-2 text-center font-medium">SS</th>
                  <th className="p-2 text-center font-medium">D</th>
                  <th className="p-2 text-center font-medium">Y</th>
                  <th className="p-2 text-center font-medium">B</th>
                  <th className="p-2 text-center font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {result.topics.map((topic) => (
                  <tr
                    key={`${topic.subjectName}-${topic.topicName}`}
                    className="border-t border-stone-100 dark:border-stone-800"
                  >
                    <td className="p-2 text-stone-600 dark:text-stone-400">{topic.subjectName}</td>
                    <td className="p-2 font-medium text-stone-900 dark:text-stone-100">{topic.topicName}</td>
                    <td className="p-2 text-center tabular-nums">{topic.questionCount}</td>
                    <td className="p-2 text-center tabular-nums">{topic.right}</td>
                    <td className="p-2 text-center tabular-nums">{topic.wrong}</td>
                    <td className="p-2 text-center tabular-nums">{topic.empty}</td>
                    <td className="p-2 text-center tabular-nums">{topic.successRate.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-700 dark:bg-stone-900/40">
        <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200">Deneme kaydı olarak ekle</h3>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          Ders netleri seçtiğiniz sınav yapısına eşleştirilir. Geometri gibi kurum tablosunda olmayan dersler boş
          kalır.
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="institution-import-exam"
              className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-400"
            >
              Sınav *
            </label>
            <select
              id="institution-import-exam"
              value={vm.examId}
              onChange={(e) => vm.setExamId(e.target.value)}
              className="input w-full"
              disabled={vm.disabled || vm.saving || vm.exams.length === 0}
            >
              <option value="">Seçiniz</option>
              {vm.exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => void vm.handleSave()}
            disabled={vm.disabled || vm.saving || !vm.examId}
            className="btn btn-primary shrink-0 gap-2"
          >
            {vm.saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            Kaydet
          </button>
        </div>
        {result.examDate ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Deneme tarihi: {result.examDate}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type PegemImportPanelProps = InstitutionImportOptions & {
  embedded?: boolean;
};

export function PegemImportPanel({
  disabled,
  exams = [],
  activeExamId,
  onSaved,
  embedded = false,
}: PegemImportPanelProps) {
  const vm = useInstitutionImport({ disabled, exams, activeExamId, onSaved });

  return (
    <div className={embedded ? undefined : `${denemeCardClass} mb-6`}>
      {!embedded ? (
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
            <Link2 className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h2 id="institution-import-heading" className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
              Kurum sonuç linki
            </h2>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Kurumunuzun yayınladığı deneme sonuç sayfası linkini yapıştırın (Pegem, Benim Hocam vb.). Ders netleri,
              puanlar ve konu dağılımı otomatik okunur; ardından deneme kaydı olarak ekleyebilirsiniz.
            </p>
          </div>
        </div>
      ) : null}

      <InstitutionImportForm vm={vm} />
      <InstitutionImportPreview vm={vm} />
    </div>
  );
}

function MetaTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-2.5 dark:border-stone-700 dark:bg-stone-900/50">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-stone-900 dark:text-stone-100">{value}</p>
    </div>
  );
}
