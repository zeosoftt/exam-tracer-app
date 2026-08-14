'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Clock,
  Loader2,
  Target,
} from 'lucide-react';
import { SubAppPageHeader, FlashMessage } from '@/components/ui';
import { DenemeTopicAnalysisPanel } from '@/components/deneme/DenemeTopicAnalysisPanel';
import { denemeCardClass } from '@/components/deneme/denemeUi';
import { formatDenemeDate } from '@/lib/deneme/computeDenemeAnalysis';
import {
  fetchDenemeAttemptAnalysis,
  fetchDenemeAttemptDetail,
  type DenemeAttemptDetail,
  type DenemeTopicAnalysis,
} from '@/lib/client-api/denemeClient';

import { ProUpgradeCard } from '@/components/checkout/ProUpgradeCard';
import { MARKETING_TOUCHPOINTS } from '@/lib/marketing/touchpoints';
import { PremiumWallTracker } from '@/components/marketing/PremiumWallTracker';

export default function DenemeDetailPageClient() {
  const params = useParams<{ id: string }>();
  const attemptId = params?.id ?? '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<DenemeAttemptDetail | null>(null);
  const [analysis, setAnalysis] = useState<DenemeTopicAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [premiumRequired, setPremiumRequired] = useState(false);

  useEffect(() => {
    if (!attemptId) {
      setError('Geçersiz deneme kaydı.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setAnalysisError(null);
    setPremiumRequired(false);

    Promise.all([fetchDenemeAttemptDetail(attemptId), fetchDenemeAttemptAnalysis(attemptId)])
      .then(([detailResult, analysisResult]) => {
        if (cancelled) return;

        if (!detailResult.ok) {
          setAttempt(null);
          if (detailResult.premiumRequired) {
            setPremiumRequired(true);
            setError(null);
          } else {
            setError(detailResult.error);
          }
          return;
        }
        setAttempt(detailResult.data);

        if (analysisResult.ok) {
          setAnalysis(analysisResult.data);
        } else if (!analysisResult.notFound) {
          setAnalysisError(analysisResult.error);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  const net = attempt?.netScore != null ? Number(attempt.netScore) : null;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <SubAppPageHeader
        title="Deneme detayı"
        icon={<Target className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden />}
        backHref="/dashboard/deneme"
      />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-stone-500 dark:text-stone-400">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Deneme detayı yükleniyor…
          </div>
        ) : null}

        {!loading && premiumRequired ? (
          <div className="space-y-6">
            <PremiumWallTracker touchpoint={MARKETING_TOUCHPOINTS.DENEME_DETAIL_WALL} />
            <ProUpgradeCard
              touchpoint={MARKETING_TOUCHPOINTS.DENEME_DETAIL_WALL}
              title="Deneme detayı Pro'da açılır"
              description="Ders bazlı sonuçlar, konu analizi ve bilgi–deneme karşılaştırması. Net trendinizi ücretsiz takip ederken detay analizi Pro ile gelir."
            />
            <div className="text-center">
              <Link href="/dashboard/deneme" className="btn btn-secondary inline-flex gap-2">
                <ArrowLeft className="h-4 w-4" />
                Deneme listesine dön
              </Link>
            </div>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="space-y-4">
            <FlashMessage type="error" variant="bordered">
              {error}
            </FlashMessage>
            <Link href="/dashboard/deneme" className="btn btn-secondary inline-flex gap-2">
              <ArrowLeft className="h-4 w-4" />
              Deneme listesine dön
            </Link>
          </div>
        ) : null}

        {!loading && attempt ? (
          <div className="space-y-6">
            <section className={`${denemeCardClass} overflow-hidden`}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                      {attempt.exam.code}
                    </span>
                  </div>
                  <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {attempt.exam.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500 dark:text-stone-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      {formatDenemeDate(attempt.attemptedAt)}
                    </span>
                    {attempt.durationMinutes != null ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {attempt.durationMinutes} dk
                      </span>
                    ) : null}
                  </div>
                </div>

                {net != null ? (
                  <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 px-6 py-4 text-center text-white shadow-lg shadow-primary-500/20">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-90">Net</p>
                    <p className="font-display text-4xl font-bold tabular-nums">
                      {net % 1 === 0 ? net : net.toFixed(2)}
                    </p>
                    {attempt.totalScore != null ? (
                      <p className="mt-1 text-sm font-medium opacity-90">{attempt.totalScore} puan</p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-stone-100 pt-5 dark:border-stone-800">
                <SummaryStat label="Doğru" value={attempt.rightCount} tone="success" />
                <SummaryStat label="Yanlış" value={attempt.wrongCount} tone="danger" />
                <SummaryStat label="Boş" value={attempt.emptyCount} tone="neutral" />
              </div>

              {attempt.notes ? (
                <div className="mt-4 rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-2.5 text-sm leading-relaxed text-stone-600 dark:border-stone-800 dark:bg-stone-950/50 dark:text-stone-400">
                  <span className="font-semibold text-stone-500">Not · </span>
                  {attempt.notes}
                </div>
              ) : null}
            </section>

            {attempt.breakdown && attempt.breakdown.length > 0 ? (
              <section className={denemeCardClass}>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-stone-100">
                  <BarChart3 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  Ders bazlı sonuçlar
                </h2>
                <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-700">
                  <table className="w-full min-w-[480px] border-collapse text-sm">
                    <thead>
                      <tr className="bg-stone-50 text-left dark:bg-stone-800/80">
                        <th className="p-3 font-medium">Ders</th>
                        <th className="p-3 text-center font-medium">D</th>
                        <th className="p-3 text-center font-medium">Y</th>
                        <th className="p-3 text-center font-medium">B</th>
                        <th className="p-3 text-center font-medium">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempt.breakdown.map((row) => (
                        <tr key={row.subjectId} className="border-t border-stone-100 dark:border-stone-800">
                          <td className="p-3 font-medium">{row.subjectName}</td>
                          <td className="p-3 text-center tabular-nums">{row.right}</td>
                          <td className="p-3 text-center tabular-nums">{row.wrong}</td>
                          <td className="p-3 text-center tabular-nums">{row.empty}</td>
                          <td className="p-3 text-center font-semibold tabular-nums text-primary-700 dark:text-primary-300">
                            {row.net.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            {analysisError ? (
              <FlashMessage type="error" variant="bordered">
                {analysisError}
              </FlashMessage>
            ) : null}

            {analysis ? <DenemeTopicAnalysisPanel analysis={analysis} /> : null}

            {!analysis && !analysisError ? (
              <section className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 dark:border-stone-700 dark:bg-stone-900/40">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Bu deneme için konu/ders bazlı analiz üretilemedi. Kurum sonucu import edilmiş denemelerde konu
                  verisiyle daha detaylı analiz görünür.
                </p>
              </section>
            ) : null}

            <div className="flex justify-start">
              <Link href="/dashboard/deneme" className="btn btn-secondary inline-flex gap-2">
                <ArrowLeft className="h-4 w-4" />
                Tüm denemelere dön
              </Link>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | null;
  tone: 'success' | 'danger' | 'neutral';
}) {
  const tones = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200',
    danger: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200',
    neutral: 'border-stone-200 bg-stone-50 text-stone-800 dark:border-stone-700 dark:bg-stone-800/80 dark:text-stone-100',
  };

  return (
    <div className={`rounded-xl border px-3 py-3 text-center ${tones[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">{value ?? '—'}</p>
    </div>
  );
}
