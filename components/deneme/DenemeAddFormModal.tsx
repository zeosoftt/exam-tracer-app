'use client';

import { useEffect } from 'react';
import { Calculator, Loader2 } from 'lucide-react';
import type { DenemeAttemptListItem, ExamTopicProgress } from '@/lib/client-api/denemeClient';
import { DenemeFormModal } from '@/components/deneme/denemeUi';
import { useDenemeForm } from '@/components/deneme/hooks/useDenemeForm';
import type { ExamOption } from '@/components/deneme/hooks/denemeFormTypes';

type DenemeAddFormModalProps = {
  open: boolean;
  onClose: () => void;
  featuresEnabled: boolean;
  exams: ExamOption[];
  activeExamId: string | null;
  topicProgressByExam: Record<string, ExamTopicProgress>;
  onPremiumRequired: () => void;
  onSubmitSuccess: (attempt?: DenemeAttemptListItem) => void;
  onMessage: (message: { type: 'success' | 'error'; text: string } | null) => void;
};

export function DenemeAddFormModal({
  open,
  onClose,
  featuresEnabled,
  exams,
  activeExamId,
  topicProgressByExam,
  onPremiumRequired,
  onSubmitSuccess,
  onMessage,
}: DenemeAddFormModalProps) {
  const {
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
  } = useDenemeForm({
    featuresEnabled,
    exams,
    activeExamId,
    formModalOpen: open,
    onPremiumRequired,
    onSubmitSuccess,
  });

  useEffect(() => {
    onMessage(message);
  }, [message, onMessage]);

  const handleClose = () => {
    onMessage(null);
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <DenemeFormModal open={featuresEnabled && open} onClose={handleClose} title="Yeni deneme kaydı">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Sınav *</label>
            <select
              required
              value={form.examId}
              onChange={(e) => setForm((f) => ({ ...f, examId: e.target.value }))}
              className="input"
            >
              <option value="">Seçiniz</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.code})
                </option>
              ))}
            </select>
            {form.examId && topicProgressByExam[form.examId]?.total ? (
              <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
                Bu sınavda konu tamamlanma:{' '}
                <strong className="tabular-nums text-emerald-700 dark:text-emerald-300">
                  %{topicProgressByExam[form.examId].pct}
                </strong>{' '}
                ({topicProgressByExam[form.examId].completed}/{topicProgressByExam[form.examId].total} konu)
              </p>
            ) : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">Deneme tarihi</label>
            <input
              type="datetime-local"
              value={form.attemptedAt}
              onChange={(e) => setForm((f) => ({ ...f, attemptedAt: e.target.value }))}
              className="input"
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
              className="input"
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
                          <td className="p-2 text-center font-medium text-primary-600">{net.toFixed(2)}</td>
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
                {calculated && Object.keys(calculated.variants).length > 0 ? (
                  <div className="mt-3 space-y-2 rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-900/40 dark:bg-primary-950/30">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-800 dark:text-primary-200">
                      ÖSYM puan önizlemesi ({calculated.scoreLabel} kayda yazılır)
                    </p>
                    {Object.keys(calculated.sectionNets).length > 0 && (
                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        {Object.entries(calculated.sectionNets).map(([key, net]) => (
                          <span key={key} className="text-stone-600 dark:text-stone-400">
                            {key} net: <strong className="text-stone-900 dark:text-stone-100">{net.toFixed(2)}</strong>
                            {calculated.sectionSP[key] != null ? (
                              <>
                                {' '}
                                · SP:{' '}
                                <strong className="text-primary-700 dark:text-primary-300">
                                  {calculated.sectionSP[key].toFixed(2)}
                                </strong>
                              </>
                            ) : null}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 pt-1">
                      {Object.entries(calculated.variants).map(([key, val]) => (
                        <span key={key} className="font-medium text-stone-700 dark:text-stone-300">
                          {key}: <strong className="text-primary-800 dark:text-primary-200">{val.toFixed(2)}</strong>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Net = Doğru − Yanlış/4. SP = ((net − μ) / σ) × 10 + 50. Popülasyon verisi varsa μ ve σ deneme
                      havuzundan alınır.
                    </p>
                  </div>
                ) : calculated ? (
                  <div className="mt-3 flex flex-wrap gap-4 rounded-lg bg-primary-50 p-3 dark:bg-primary-950/30">
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      Toplam net:{' '}
                      <strong className="text-primary-700 dark:text-primary-300">{calculated.totalNet.toFixed(2)}</strong>
                    </span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      Hesaplanan puan:{' '}
                      <strong className="text-primary-700 dark:text-primary-300">
                        {calculated.calculatedScore.toFixed(2)}
                        {maxScore !== 100 ? ` / ${maxScore}` : ''}
                      </strong>
                    </span>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Bu sınav için ders yapısı tanımlı değil. Toplam doğru / yanlış / boş girin; net ve puan otomatik
                  hesaplanır.
                </p>
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
                {calculated && (
                  <div className="mt-3 flex flex-wrap gap-4 rounded-lg bg-primary-50 p-3 dark:bg-primary-950/30">
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      Toplam net:{' '}
                      <strong className="text-primary-700 dark:text-primary-300">{calculated.totalNet.toFixed(2)}</strong>
                    </span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      Hesaplanan puan:{' '}
                      <strong className="text-primary-700 dark:text-primary-300">
                        {calculated.calculatedScore.toFixed(2)}
                        {maxScore !== 100 ? ` / ${maxScore}` : ''}
                      </strong>
                    </span>
                  </div>
                )}
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
            className="input"
            placeholder="Örn. 1. deneme..."
          />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-5 dark:border-stone-800">
          <button
            type="submit"
            disabled={
              submitting ||
              !!(form.examId && examSubjects.length > 0 && !breakdownForSubmit.some((b) => b.right > 0 || b.wrong > 0 || b.empty > 0))
            }
            className="btn btn-primary gap-2"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          {calculated ? (
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Önizleme:{' '}
              <strong className="tabular-nums text-primary-700 dark:text-primary-300">
                {calculated.totalNet.toFixed(2)} net
              </strong>
            </p>
          ) : null}
        </div>
      </form>
    </DenemeFormModal>
  );
}
