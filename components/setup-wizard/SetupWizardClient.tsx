'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Flame,
  Layers,
  Loader2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getMaxScoreForExam } from '@/lib/constants/examScoreRanges';
import {
  countTopicsInExam,
  computeSetupWizardTopicPlan,
  SETUP_WIZARD_TOPICS_PER_SUBJECT,
  type SetupWizardTopicPlan,
} from '@/lib/setup-wizard/topicPresetSelection';
import { SETUP_WIZARD_SAMPLE_DENEME, setupWizardSampleDenemeNet } from '@/lib/setup-wizard/sampleDeneme';
import { postSetupWizard, type SetupWizardAssignment } from '@/lib/client-api/setupWizardClient';
import { mapExamApiDataToWizardInput } from '@/components/setup-wizard/examTreeMap';

const STEP_COUNT = 4;

function formatDurationMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m} dakika`;
  if (m === 0) return `${h} saat`;
  return `${h} saat ${m} dk`;
}

export default function SetupWizardClient({
  userFirstName,
  lockedExam,
}: {
  userFirstName: string;
  /** Kayıtta seçilen veya atanmış sınav; yoksa sihirbaz açılmamalı (boş durum) */
  lockedExam: SetupWizardAssignment | null;
}) {
  const router = useRouter();
  const ringGradientId = useId().replace(/:/g, '');
  const examId = lockedExam?.examId ?? null;
  const selectedExam = lockedExam;

  const [step, setStep] = useState(1);
  const [preset, setPreset] = useState<'none' | 'starter' | 'solid'>('starter');
  const [addDeneme, setAddDeneme] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [topicPlan, setTopicPlan] = useState<SetupWizardTopicPlan | null>(null);
  const [totalExamTopics, setTotalExamTopics] = useState<number | null>(null);

  useEffect(() => {
    if (step !== 2 || !examId) return;

    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);
    setTopicPlan(null);

    (async () => {
      try {
        const res = await fetch(`/api/exams/${examId}`);
        const json = (await res.json().catch(() => ({}))) as { success?: boolean; data?: unknown };
        if (cancelled) return;
        if (!res.ok || !json.success || !json.data) {
          setPreviewError('Müfredat yüklenemedi. İnternet bağlantını kontrol et veya geri dönüp tekrar dene.');
          setPreviewLoading(false);
          return;
        }
        const input = mapExamApiDataToWizardInput(json.data);
        if (!input) {
          setPreviewError('Sınav yapısı okunamadı.');
          setPreviewLoading(false);
          return;
        }
        const total = countTopicsInExam(input);
        if (!cancelled) setTotalExamTopics(total);

        if (preset === 'none') {
          if (!cancelled) {
            setTopicPlan({
              topicIds: [],
              previewSections: [
                {
                  heading: 'Konu ilerlemesi',
                  lines: ['Tamamlanan konu eklenmeyecek. İlerlemeyi panelden kendin işaretleyebilirsin.'],
                },
              ],
            });
          }
        } else if (!cancelled) {
          setTopicPlan(computeSetupWizardTopicPlan(preset, input));
        }
      } catch {
        if (!cancelled) setPreviewError('Yükleme hatası.');
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [step, examId, preset]);

  const canGoNext =
    step === 2
      ? preset === 'none' || (!previewLoading && !previewError && topicPlan !== null)
      : true;

  const goNext = () => {
    if (!canGoNext) return;
    setStep((s) => Math.min(STEP_COUNT, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSkip = useCallback(async () => {
    setSaving(true);
    setError(null);
    const r = await postSetupWizard({ action: 'skip' });
    setSaving(false);
    if (!r.ok) {
      setError(r.error ?? 'İşlem tamamlanamadı.');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }, [router]);

  const handleFinish = useCallback(async () => {
    if (!examId) return;
    setSaving(true);
    setError(null);
    const r = await postSetupWizard({
      action: 'finish',
      examId,
      progressPreset: preset,
      addSampleDeneme: addDeneme,
    });
    setSaving(false);
    if (!r.ok) {
      setError(r.error ?? 'Kayıt oluşturulamadı.');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }, [router, examId, preset, addDeneme]);

  const progress = (step / STEP_COUNT) * 100;

  const summaryKonuLabel =
    preset === 'none'
      ? 'Yok'
      : preset === 'starter'
        ? `Her dersten ilk ${SETUP_WIZARD_TOPICS_PER_SUBJECT.starter} konu (toplam ${topicPlan?.topicIds.length ?? 0} işaretlenecek)`
        : `Her dersten ilk ${SETUP_WIZARD_TOPICS_PER_SUBJECT.solid} konu (toplam ${topicPlan?.topicIds.length ?? 0} işaretlenecek)`;

  const sampleDenemePreview = useMemo(() => {
    const { rightCount, wrongCount, emptyCount, durationMinutes, daysAgo, notes } = SETUP_WIZARD_SAMPLE_DENEME;
    const net = setupWizardSampleDenemeNet();
    const totalQ = rightCount + wrongCount + emptyCount;
    const examCode = lockedExam?.code ?? 'KPSS';
    const maxScore = getMaxScoreForExam(examCode);
    const totalScore =
      totalQ > 0
        ? Math.max(0, Math.min(maxScore, Math.round(((net / totalQ) * maxScore + Number.EPSILON) * 100) / 100))
        : null;
    return {
      rightCount,
      wrongCount,
      emptyCount,
      durationMinutes,
      daysAgo,
      notes,
      net,
      totalQ,
      maxScore,
      totalScore,
      examCode,
    };
  }, [lockedExam?.code]);

  const completionPitch = useMemo(() => {
    const done = topicPlan?.topicIds.length ?? 0;
    const total = totalExamTopics ?? 0;
    const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    const firstName = userFirstName.trim() || 'Sen';

    type Variant = 'progress' | 'blank' | 'unknown';
    let variant: Variant;
    if (total <= 0) variant = 'unknown';
    else if (done <= 0) variant = 'blank';
    else variant = 'progress';

    const secondary: string[] = [];
    if (variant === 'progress') {
      if (pct >= 60) secondary.push('Panelin anlamlı kısmı doluyor; bu tempoyu korumak iyi bir alışkanlık.');
      else if (pct >= 35) secondary.push('Güçlü bir sıçrama tahtası hazır; üzerine eklemek kolay.');
      else secondary.push('Hafif bir örnek set; asıl yükseliş senin çalışmanla gelecek.');
    }
    if (addDeneme) secondary.push('Deneme grafiğine tek kayıtla canlılık ekliyoruz.');
    if (variant === 'blank' && !addDeneme) secondary.push('Tamamen temiz sayfa: ilk işareti sen atacaksın.');

    let headline: string;
    let subhead: string;
    let primary: string;
    let ringValue: number | null;
    let ringCaption: string;

    if (variant === 'progress') {
      ringValue = pct;
      ringCaption = 'örnek tamamlanma';
      primary = `${done} / ${total} konu, müfredatın yaklaşık %${pct}'i örnek olarak tamamlandı görünecek.`;
      if (pct >= 75) {
        headline = `${firstName}, şimdiden güçlü bir tablo!`;
        subhead = 'Panel seni dolu bir çizgiyle karşılıyor; üstüne koymak çok daha kolay hissettirecek.';
      } else if (pct >= 50) {
        headline = 'Yarıyı geçtin — ritim yakalandı';
        subhead = 'Bu oran motivasyon için ideal bir sıçrama tahtası; devamı sende.';
      } else if (pct >= 35) {
        headline = 'Sağlam bir başlangıç çizgisi';
        subhead = 'İlk veri setin anlamlı; ekseni görüp üzerine inşa edebilirsin.';
      } else if (pct >= 15) {
        headline = 'İlk sinyal net: yol açık';
        subhead = 'Küçük ama okunaklı bir örnek; grafiğin “sıfırdan” değil “buradan” başlıyor.';
      } else {
        headline = 'İlk adım atıldı';
        subhead = 'Örnek işaretler çizgiyi başlattı; asıl yükseliş senin tekrarlarınla gelecek.';
      }
    } else if (variant === 'blank') {
      ringValue = 0;
      ringCaption = 'temiz başlangıç';
      headline = `${firstName}, tuval temiz`;
      subhead = 'İlerlemeyi sıfırdan sen yazacaksın; ilk zaferin daha da tatlı olacak.';
      primary = 'Örnek konu işaretlemesi yok — paneller ilk verini senden bekliyor.';
    } else {
      ringValue = null;
      ringCaption = '';
      headline = 'Son adım — hazırsın';
      subhead = 'Ayarların kaydedilecek; panelde ince ayar her zaman mümkün.';
      primary = 'Müfredat konu sayısı okunamadı; kurulum yine de tamamlanır.';
    }

    return {
      pct,
      done,
      total,
      primary,
      secondary,
      headline,
      subhead,
      variant,
      ringValue,
      ringCaption,
      firstName,
    };
  }, [topicPlan, totalExamTopics, addDeneme, userFirstName]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-stone-50 via-primary-50/40 to-amber-50/50 text-stone-900 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 dark:text-stone-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col px-4 py-10 sm:max-w-xl sm:px-6 sm:py-14">
        <header className="mb-8 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100">
            <BookOpen className="h-5 w-5 text-primary-600" />
            <span className="font-display font-bold">The Goal Lab</span>
          </Link>
          <button
            type="button"
            onClick={handleSkip}
            disabled={saving}
            className="text-xs font-semibold text-stone-500 underline-offset-4 hover:text-stone-800 hover:underline disabled:opacity-50 dark:text-stone-400 dark:hover:text-stone-200"
          >
            Atla
          </button>
        </header>

        <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-stone-200/80 dark:bg-stone-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-600 to-amber-500 transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Adım {step} / {STEP_COUNT}
        </p>

        <div className="flex flex-1 flex-col rounded-3xl border border-stone-200/80 bg-white/90 p-6 shadow-xl shadow-stone-200/50 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/90 dark:shadow-none sm:p-8">
          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : null}

          {!lockedExam ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <Layers className="mb-4 h-12 w-12 text-stone-400" />
              <h1 className="font-display text-xl font-bold">Sınav bulunamadı</h1>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                Hesabına atanmış sınav yok. Ayarlardan sınav seçip kaydettiğinde bu adım atlanır; şimdilik destek ile iletişime geçebilir veya panele dönebilirsin.
              </p>
              <button
                type="button"
                onClick={handleSkip}
                disabled={saving}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Panele geç
              </button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="animate-in fade-in duration-300">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-800 dark:bg-primary-950/60 dark:text-primary-200">
                    <Sparkles className="h-3.5 w-3.5" />
                    Hızlı kurulum
                  </div>
                  <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                    {userFirstName}, panele hazırlanalım
                  </h1>
                  <p className="mt-3 rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-2.5 text-sm dark:border-stone-700 dark:bg-stone-800/80">
                    <span className="text-stone-500 dark:text-stone-400">Kayıtta seçtiğin sınav:</span>{' '}
                    <span className="font-bold text-stone-900 dark:text-stone-100">{lockedExam.name}</span>
                    <span className="text-stone-500 dark:text-stone-400"> · {lockedExam.code}</span>
                  </p>
                  <h2 className="mt-6 font-display text-lg font-bold text-stone-900 dark:text-stone-100">Konu çalışması</h2>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                    Örnek tamamlanmış konular ekleyelim mi? Gerçek ilerlemeni sonra panelden güncellersin.
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      {
                        id: 'none' as const,
                        title: 'Sıfırdan başlıyorum',
                        desc: 'Konu işaretleme yok; listeyi sıfırdan kendin doldurursun.',
                      },
                      {
                        id: 'starter' as const,
                        title: 'Biraz ilerledim',
                        desc: `Her dersten sırayla ilk ${SETUP_WIZARD_TOPICS_PER_SUBJECT.starter} konuyu tamamlandı say (derste ${SETUP_WIZARD_TOPICS_PER_SUBJECT.starter}’ten az varsa hepsi).`,
                      },
                      {
                        id: 'solid' as const,
                        title: 'Epey çalıştım',
                        desc: `Her dersten sırayla ilk ${SETUP_WIZARD_TOPICS_PER_SUBJECT.solid} konuyu tamamlandı say (derste ${SETUP_WIZARD_TOPICS_PER_SUBJECT.solid}’dan az varsa hepsi).`,
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPreset(opt.id)}
                        className={cn(
                          'flex w-full flex-col rounded-2xl border-2 p-4 text-left transition-all',
                          preset === opt.id
                            ? 'border-emerald-500 bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/30'
                            : 'border-stone-200 hover:border-stone-300 dark:border-stone-700 dark:hover:border-stone-600',
                        )}
                      >
                        <span className="font-semibold">{opt.title}</span>
                        <span className="mt-1 text-sm text-stone-600 dark:text-stone-400">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in duration-300">
                  <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Ne işaretlenecek?</h1>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                    Seçiminle aynı liste sunucuda da uygulanacak. Devam etmeden önce göz at.
                  </p>

                  {previewLoading ? (
                    <div className="mt-10 flex flex-col items-center gap-3 text-stone-500 dark:text-stone-400">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                      <p className="text-sm">Müfredat yükleniyor…</p>
                    </div>
                  ) : previewError ? (
                    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
                      {previewError}
                    </div>
                  ) : topicPlan ? (
                    <div className="mt-6 max-h-[min(52vh,28rem)] space-y-4 overflow-y-auto pr-1">
                      {topicPlan.previewSections.length === 0 ? (
                        <p className="text-sm text-stone-600 dark:text-stone-400">Bu seçimle konu eklenmiyor.</p>
                      ) : (
                        topicPlan.previewSections.map((sec) => (
                          <div
                            key={sec.heading}
                            className="rounded-xl border border-stone-200 bg-stone-50/80 p-3 dark:border-stone-700 dark:bg-stone-800/50"
                          >
                            <p className="text-xs font-bold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                              {sec.heading}
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-stone-700 dark:text-stone-200">
                              {sec.lines.map((line, i) => (
                                <li key={i} className="flex gap-2">
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                                  <span>{line}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))
                      )}
                      {preset !== 'none' && (
                        <p className="text-center text-xs font-medium text-stone-500 dark:text-stone-400">
                          Toplam <strong className="text-stone-800 dark:text-stone-200">{topicPlan.topicIds.length}</strong>{' '}
                          konu tamamlandı olarak kaydedilecek.
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {step === 3 && (
                <div className="animate-in fade-in duration-300">
                  <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Deneme kaydı</h1>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                    Geçmiş bir denemeyi örnek olarak ekleyelim mi? Sihirbazın oluşturduğu kayıt notta belirtilir; dilediğinde silebilirsin.
                  </p>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setAddDeneme(false)}
                      className={cn(
                        'rounded-2xl border-2 p-6 text-center transition-all',
                        !addDeneme
                          ? 'border-primary-500 bg-primary-50/70 dark:border-primary-400 dark:bg-primary-950/40'
                          : 'border-stone-200 dark:border-stone-700',
                      )}
                    >
                      <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-stone-600 dark:text-stone-300" />
                      <span className="font-bold">Örnek deneme yok</span>
                      <p className="mt-1 text-xs text-stone-500">Önce konu tarafını bitir</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddDeneme(true)}
                      className={cn(
                        'rounded-2xl border-2 p-6 text-center transition-all',
                        addDeneme
                          ? 'border-amber-500 bg-amber-50/80 dark:border-amber-500 dark:bg-amber-950/30'
                          : 'border-stone-200 dark:border-stone-700',
                      )}
                    >
                      <ClipboardList className="mx-auto mb-2 h-8 w-8 text-amber-700 dark:text-amber-400" />
                      <span className="font-bold">Örnek deneme ekle</span>
                      <p className="mt-1 text-xs text-stone-500">Tek deneme + makul net</p>
                    </button>
                  </div>
                  {preset !== 'none' && totalExamTopics != null && totalExamTopics > 0 ? (
                    <p className="mt-4 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
                      Konu ilerlemen (kurulum sonrası): yaklaşık{' '}
                      <strong className="tabular-nums">
                        %
                        {Math.min(
                          100,
                          Math.round(((topicPlan?.topicIds.length ?? 0) / totalExamTopics) * 100),
                        )}
                      </strong>{' '}
                      <span className="text-emerald-800/90 dark:text-emerald-200/90">
                        ({topicPlan?.topicIds.length ?? 0} / {totalExamTopics} konu)
                      </span>
                    </p>
                  ) : null}
                  {addDeneme ? (
                    <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 text-sm dark:border-amber-800/50 dark:bg-amber-950/25">
                      <p className="font-semibold text-stone-900 dark:text-stone-100">Oluşturulacak örnek deneme</p>
                      <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                        Aşağıdaki değerler sunucuya yazılır; notta kurulum kaynağı belirtilir.
                      </p>
                      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                        <div className="rounded-lg bg-white/70 px-3 py-2 dark:bg-stone-900/60">
                          <dt className="font-medium text-stone-500 dark:text-stone-400">Doğru / Yanlış / Boş</dt>
                          <dd className="mt-0.5 font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                            {sampleDenemePreview.rightCount} / {sampleDenemePreview.wrongCount} / {sampleDenemePreview.emptyCount}{' '}
                            <span className="font-normal text-stone-500">({sampleDenemePreview.totalQ} soru)</span>
                          </dd>
                        </div>
                        <div className="rounded-lg bg-white/70 px-3 py-2 dark:bg-stone-900/60">
                          <dt className="font-medium text-stone-500 dark:text-stone-400">Net</dt>
                          <dd className="mt-0.5 font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                            {Number.isInteger(sampleDenemePreview.net)
                              ? sampleDenemePreview.net
                              : sampleDenemePreview.net.toFixed(2)}
                          </dd>
                        </div>
                        <div className="rounded-lg bg-white/70 px-3 py-2 dark:bg-stone-900/60">
                          <dt className="font-medium text-stone-500 dark:text-stone-400">Ham puan (tahmini)</dt>
                          <dd className="mt-0.5 font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                            {sampleDenemePreview.totalScore != null
                              ? `${sampleDenemePreview.totalScore} / ${sampleDenemePreview.maxScore} (${sampleDenemePreview.examCode})`
                              : '—'}
                          </dd>
                        </div>
                        <div className="rounded-lg bg-white/70 px-3 py-2 dark:bg-stone-900/60">
                          <dt className="font-medium text-stone-500 dark:text-stone-400">Süre</dt>
                          <dd className="mt-0.5 font-semibold text-stone-900 dark:text-stone-100">
                            {formatDurationMinutes(sampleDenemePreview.durationMinutes)} ({sampleDenemePreview.durationMinutes} dk)
                          </dd>
                        </div>
                        <div className="sm:col-span-2 rounded-lg bg-white/70 px-3 py-2 dark:bg-stone-900/60">
                          <dt className="font-medium text-stone-500 dark:text-stone-400">Tarih</dt>
                          <dd className="mt-0.5 text-stone-800 dark:text-stone-200">
                            Yaklaşık <strong>{sampleDenemePreview.daysAgo}</strong> gün önce (deneme tarihi geriye alınır)
                          </dd>
                        </div>
                      </dl>
                      <p className="mt-3 rounded-lg border border-stone-200/80 bg-stone-50/80 px-3 py-2 text-xs text-stone-600 dark:border-stone-700 dark:bg-stone-800/50 dark:text-stone-300">
                        <span className="font-medium text-stone-700 dark:text-stone-200">Not:</span> {sampleDenemePreview.notes}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              {step === 4 && (
                <div className="animate-in fade-in duration-300">
                  <section
                    className="relative mt-6 overflow-hidden rounded-3xl border-2 border-primary-300/50 bg-gradient-to-br from-primary-500/[0.12] via-amber-400/[0.08] to-primary-600/[0.06] p-[1px] shadow-lg shadow-primary-500/10 dark:border-primary-500/25 dark:from-primary-500/20 dark:via-amber-500/10 dark:to-primary-900/30 dark:shadow-primary-900/20"
                    aria-labelledby="setup-wizard-celebration-title"
                  >
                    <div className="relative overflow-hidden rounded-[1.4rem] bg-white/95 px-5 py-7 dark:bg-stone-950/95 sm:px-7 sm:py-8">
                      <div
                        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/25 blur-3xl dark:bg-amber-500/15"
                        aria-hidden
                      />
                      <div
                        className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-primary-500/20 blur-3xl dark:bg-primary-600/20"
                        aria-hidden
                      />

                      <div className="relative flex flex-col items-center gap-7 sm:flex-row sm:items-start sm:gap-8">
                        {completionPitch.ringValue !== null ? (
                          <div className="relative flex shrink-0 flex-col items-center">
                            <div className="relative h-[9.5rem] w-[9.5rem]">
                              <svg
                                className="h-full w-full -rotate-90 text-stone-200 dark:text-stone-800"
                                viewBox="0 0 120 120"
                                aria-hidden
                              >
                                <defs>
                                  <linearGradient id={ringGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#14b8a6" />
                                    <stop offset="55%" stopColor="#0d9488" />
                                    <stop offset="100%" stopColor="#f59e0b" />
                                  </linearGradient>
                                </defs>
                                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="9" />
                                {completionPitch.variant === 'blank' ? (
                                  <circle
                                    cx="60"
                                    cy="60"
                                    r="52"
                                    fill="none"
                                    stroke={`url(#${ringGradientId})`}
                                    strokeWidth="9"
                                    strokeLinecap="round"
                                    strokeDasharray="8 14"
                                    className="opacity-85"
                                  />
                                ) : (
                                  <circle
                                    cx="60"
                                    cy="60"
                                    r="52"
                                    fill="none"
                                    stroke={`url(#${ringGradientId})`}
                                    strokeWidth="9"
                                    strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 52}
                                    strokeDashoffset={(2 * Math.PI * 52) * (1 - completionPitch.ringValue / 100)}
                                    className="transition-[stroke-dashoffset] duration-1000 ease-out"
                                  />
                                )}
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                {completionPitch.variant === 'blank' ? (
                                  <>
                                    <span className="font-display text-3xl font-black tracking-tight text-primary-700 dark:text-primary-300">
                                      Başla
                                    </span>
                                    <span className="mt-1 max-w-[6rem] text-[10px] font-semibold uppercase leading-tight tracking-wide text-stone-500 dark:text-stone-400">
                                      {completionPitch.ringCaption}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span className="font-display text-4xl font-black tabular-nums tracking-tight text-stone-900 dark:text-white">
                                      {completionPitch.ringValue}
                                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">%</span>
                                    </span>
                                    <span className="mt-0.5 max-w-[5.5rem] text-[10px] font-semibold uppercase leading-tight tracking-wide text-stone-500 dark:text-stone-400">
                                      {completionPitch.ringCaption}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            {completionPitch.variant === 'progress' ? (
                              <p className="mt-2 text-center text-xs font-medium tabular-nums text-stone-500 dark:text-stone-400">
                                <span className="font-bold text-stone-800 dark:text-stone-200">{completionPitch.done}</span>
                                {' / '}
                                <span>{completionPitch.total}</span> konu
                              </p>
                            ) : completionPitch.variant === 'blank' ? (
                              <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                Sıfırdan başla
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <div className="flex h-[9.5rem] w-[9.5rem] shrink-0 flex-col items-center justify-center rounded-full border-2 border-dashed border-primary-300/60 bg-gradient-to-br from-primary-50 to-amber-50/80 dark:border-primary-500/40 dark:from-primary-950/50 dark:to-amber-950/30">
                            <Sparkles className="h-14 w-14 text-primary-500 dark:text-primary-400" strokeWidth={1.25} aria-hidden />
                            <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary-700/90 dark:text-primary-300">
                              Hazır
                            </span>
                          </div>
                        )}

                        <div className="min-w-0 flex-1 text-center sm:text-left">
                          <p className="inline-flex items-center gap-1.5 rounded-full border border-primary-200/80 bg-primary-50/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary-800 dark:border-primary-500/30 dark:bg-primary-950/60 dark:text-primary-200">
                            <Flame className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                            Son durum
                          </p>
                          <h2
                            id="setup-wizard-celebration-title"
                            className="mt-3 font-display text-2xl font-black leading-tight tracking-tight text-stone-900 dark:text-white sm:text-3xl"
                          >
                            {completionPitch.headline}
                          </h2>
                          <p className="mt-2 text-sm font-medium leading-relaxed text-stone-600 dark:text-stone-300">
                            {completionPitch.subhead}
                          </p>
                          <p className="mt-4 rounded-xl border border-stone-200/80 bg-stone-50/90 px-3.5 py-2.5 text-left text-xs leading-relaxed text-stone-600 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-400">
                            {completionPitch.primary}
                          </p>
                          {completionPitch.secondary.length > 0 ? (
                            <ul className="mt-4 space-y-2.5 text-left text-sm">
                              {completionPitch.secondary.map((line, i) => (
                                <li
                                  key={i}
                                  className="flex gap-3 rounded-xl bg-gradient-to-r from-primary-50/80 to-transparent py-2 pl-1 dark:from-primary-950/40 dark:to-transparent"
                                >
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white shadow-md shadow-primary-600/25 dark:bg-primary-500">
                                    <TrendingUp className="h-4 w-4" aria-hidden />
                                  </span>
                                  <span className="self-center font-medium leading-snug text-stone-800 dark:text-stone-200">{line}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </section>

                  <ul className="mt-6 space-y-3 text-sm">
                    <li className="flex justify-between gap-4 border-b border-stone-100 pb-2 dark:border-stone-800">
                      <span className="text-stone-500">Sınav</span>
                      <span className="font-semibold text-right">{selectedExam?.name ?? '—'}</span>
                    </li>
                    <li className="flex justify-between gap-4 border-b border-stone-100 pb-2 dark:border-stone-800">
                      <span className="text-stone-500">Konular</span>
                      <span className="max-w-[60%] text-right font-semibold">{summaryKonuLabel}</span>
                    </li>
                    <li className="flex justify-between gap-4 border-b border-stone-100 pb-2 dark:border-stone-800">
                      <span className="text-stone-500">Konu tamamlanma</span>
                      <span className="text-right font-semibold tabular-nums">
                        {completionPitch.total > 0 && completionPitch.done > 0
                          ? `%${completionPitch.pct} (${completionPitch.done}/${completionPitch.total})`
                          : completionPitch.total > 0
                            ? '%0'
                            : '—'}
                      </span>
                    </li>
                    <li className="flex flex-col gap-1 border-b border-stone-100 pb-2 dark:border-stone-800 sm:flex-row sm:justify-between sm:gap-4">
                      <span className="text-stone-500">Deneme</span>
                      <span className="text-right font-semibold sm:max-w-[60%]">
                        {addDeneme ? (
                          <>
                            Örnek 1 kayıt — D/Y/B {sampleDenemePreview.rightCount}/
                            {sampleDenemePreview.wrongCount}/{sampleDenemePreview.emptyCount}, net{' '}
                            {Number.isInteger(sampleDenemePreview.net)
                              ? sampleDenemePreview.net
                              : sampleDenemePreview.net.toFixed(2)}
                          </>
                        ) : (
                          'Yok'
                        )}
                      </span>
                    </li>
                  </ul>
                  <p className="mt-6 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                    Onayladığında seçimlerin hesabına yazılır; kurulum bir daha gösterilmez. İstediğin zaman panelden düzenleyebilirsin.
                  </p>
                </div>
              )}

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-6 dark:border-stone-800">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step <= 1 || saving}
                  className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 disabled:opacity-40 dark:border-stone-600 dark:text-stone-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Geri
                </button>
                {step < STEP_COUNT ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canGoNext || saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-600/25 disabled:opacity-40"
                  >
                    İleri
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={saving || !examId}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Panele geç
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
