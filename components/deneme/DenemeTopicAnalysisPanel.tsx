'use client';

import { AlertTriangle, Brain, CheckCircle2, Sparkles, Target, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AnalysisGlossary, AnalysisTermHint } from '@/components/deneme/AnalysisTermHint';
import { denemeCardClass } from '@/components/deneme/denemeUi';
import { getGapBadgeLabel } from '@/lib/deneme/analysis/termDefinitions';
import type { DenemeTopicAnalysisResult, DenemeTopicAnalysisRow } from '@/lib/deneme/analysis/types';

type DenemeTopicAnalysisPanelProps = {
  analysis: DenemeTopicAnalysisResult;
};

const HEALTH_LABELS = {
  good: 'İyi uyum — bilgi denemeye yansıyor',
  mixed: 'Karışık — bazı konularda fark var',
  critical: 'Dikkat — ciddi bilgi–deneme uyumsuzluğu',
} as const;

export function DenemeTopicAnalysisPanel({ analysis }: DenemeTopicAnalysisPanelProps) {
  const { summary } = analysis;
  const healthStyles = {
    good: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100',
    mixed: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100',
    critical: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-100',
  } as const;

  return (
    <section className="space-y-6">
      <AnalysisGlossary />

      <div className={cn(denemeCardClass, healthStyles[summary.overallHealth])}>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/70 dark:bg-stone-900/40">
            <Brain className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold">Konu bilgisi × Deneme karşılaştırması</h2>
            <p className="mt-1 text-sm opacity-90">{HEALTH_LABELS[summary.overallHealth]}</p>
            <p className="mt-1 text-xs opacity-80">
              Konu takibindeki öğrenme ile bu denemedeki performans yan yana değerlendirildi.
              {summary.analysisMode === 'subject'
                ? ' Konu detayı olmadığı için ders bazlı tahmini analiz kullanıldı.'
                : null}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricTile term="knowledge" value={`${summary.avgKnowledge.toFixed(1)}%`} hint="Ortalama konu bilgisi" />
          <MetricTile term="performance" value={`${summary.avgPerformance.toFixed(1)}%`} hint="Ortalama deneme başarısı" />
          <MetricTile term="gap" value={`${summary.avgGap.toFixed(1)} puan`} hint="Ortalama bilgi farkı" />
          <MetricTile term="application" value={`${summary.avgApplicationRate.toFixed(1)}%`} hint="Ortalama aktarım" />
        </div>

        <p className="mt-3 text-[11px] opacity-75">
          İpucu: Altı çizili terimlere tıklayın veya üzerine gelin — ne anlama geldiği açıklanır.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <SummaryBadge count={summary.fakeMasteryCount} term="fakeMastery" />
          <SummaryBadge count={summary.riskyGapCount} term="gapRisky" />
          <SummaryBadge count={summary.criticalGapCount} term="gapCritical" />
          <SummaryBadge count={analysis.strongTransferTopics.length} term="strongTransfer" />
        </div>
      </div>

      {analysis.fakeMasteryTopics.length > 0 ? (
        <AnalysisGroup
          title="Yanıltıcı öğrenme"
          description="Konu takibinde tamamlanmış görünüyor ama bu denemede yapılamadı. Gerçek öğrenme yerine ezber/tamamlama olabilir."
          icon={<AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />}
          rows={analysis.fakeMasteryTopics.slice(0, 6)}
        />
      ) : null}

      {analysis.priorities.length > 0 ? (
        <AnalysisGroup
          title="Önce çalışmanız gereken konular"
          description="Öncelik etkisi en yüksek konular — hem bilgi farkı büyük hem denemede soru ağırlığı yüksek."
          icon={<Target className="h-5 w-5 text-primary-600 dark:text-primary-400" />}
          rows={analysis.priorities}
        />
      ) : null}

      {analysis.strongTransferTopics.length > 0 ? (
        <AnalysisGroup
          title="İyi aktarılan konular"
          description="Öğrendiğiniz bilgi bu denemede karşılığını bulmuş."
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          rows={analysis.strongTransferTopics}
          compact
        />
      ) : null}

      <section className={denemeCardClass}>
        <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-stone-900 dark:text-stone-100">
          <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          Tüm analiz edilen konular
        </h3>
        <div className="space-y-3">
          {analysis.topics.map((row) => (
            <TopicAnalysisRow key={`${row.topicName}-${row.subjectName}`} row={row} />
          ))}
        </div>
      </section>
    </section>
  );
}

function MetricTile({
  term,
  value,
  hint,
}: {
  term: 'knowledge' | 'performance' | 'gap' | 'application';
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-white/60 bg-white/60 px-3 py-2.5 dark:border-stone-800 dark:bg-stone-900/40">
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
        <AnalysisTermHint term={term} labelClassName="text-[10px] uppercase tracking-wide opacity-100" />
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[10px] opacity-70">{hint}</p>
    </div>
  );
}

function SummaryBadge({
  count,
  term,
}: {
  count: number;
  term: 'fakeMastery' | 'gapRisky' | 'gapCritical' | 'strongTransfer';
}) {
  if (count <= 0) return null;
  const tones = {
    fakeMastery: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200',
    gapRisky: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200',
    gapCritical: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200',
    strongTransfer: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200',
  };

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1', tones[term])}>
      <span className="font-bold tabular-nums">{count}</span>
      <AnalysisTermHint term={term} showIcon={false} labelClassName="no-underline font-semibold" />
    </span>
  );
}

function AnalysisGroup({
  title,
  description,
  icon,
  rows,
  compact = false,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  rows: DenemeTopicAnalysisRow[];
  compact?: boolean;
}) {
  return (
    <section className={denemeCardClass}>
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">{title}</h3>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p>
        </div>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <TopicAnalysisRow key={`${row.topicName}-${row.subjectName}`} row={row} compact={compact} />
        ))}
      </div>
    </section>
  );
}

function TopicAnalysisRow({ row, compact = false }: { row: DenemeTopicAnalysisRow; compact?: boolean }) {
  const isOutperforming = row.gap != null && row.gap < 0;
  const gapTone = isOutperforming
    ? 'text-emerald-700 dark:text-emerald-300'
    : row.gapRisk === 'critical'
      ? 'text-red-700 dark:text-red-300'
      : row.gapRisk === 'risky'
        ? 'text-amber-700 dark:text-amber-300'
        : 'text-stone-600 dark:text-stone-300';

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 dark:border-stone-700 dark:bg-stone-900/50">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-stone-900 dark:text-stone-100">{row.topicName}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">{row.subjectName}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-bold">
          {row.fakeMastery ? (
            <span className="rounded-md bg-red-100 px-2 py-1 text-red-800 dark:bg-red-950/50 dark:text-red-200">
              Yanıltıcı öğrenme
            </span>
          ) : null}
          {row.gap != null && row.gapRisk ? (
            <span
              className={cn(
                'rounded-md px-2 py-1',
                isOutperforming
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
                  : 'bg-white dark:bg-stone-800',
                !isOutperforming && gapTone,
              )}
            >
              Bilgi farkı {row.gap.toFixed(1)} · {getGapBadgeLabel(row.gap, row.gapRisk)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <MiniStat
          term="knowledge"
          value={`${row.knowledgeScore.toFixed(0)}%`}
          sub={row.knowledgeLevelLabel}
        />
        <MiniStat
          term="performance"
          value={`${row.performanceScore?.toFixed(0) ?? '—'}%`}
          sub={`${row.examRight} doğru / ${row.questionCount} soru`}
        />
        <MiniStat
          term="gap"
          value={row.gap != null ? `${row.gap > 0 ? '+' : ''}${row.gap.toFixed(1)} puan` : '—'}
          sub={isOutperforming ? 'Deneme > Bilgi (iyi)' : 'Bilgi − Deneme'}
        />
        <MiniStat
          term="application"
          value={`${row.applicationRate?.toFixed(0) ?? '—'}%`}
          sub="Denemenin bilgiye oranı"
        />
        {!compact ? (
          <MiniStat term="impact" value={row.impactScore.toFixed(1)} sub="Önce buna odaklan" />
        ) : null}
      </div>

      {!compact ? (
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
          <TrendingDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-600 dark:text-primary-400" />
          <span>
            <span className="font-semibold text-stone-700 dark:text-stone-300">Ne yapmalı? </span>
            {row.recommendation}
          </span>
        </p>
      ) : null}
    </div>
  );
}

function MiniStat({
  term,
  value,
  sub,
}: {
  term: 'knowledge' | 'performance' | 'gap' | 'application' | 'impact';
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-2.5 py-2 dark:border-stone-700 dark:bg-stone-900">
      <p className="text-[10px] font-semibold text-stone-500">
        <AnalysisTermHint term={term} labelClassName="text-[10px] text-stone-500 dark:text-stone-400" />
      </p>
      <p className="mt-0.5 text-sm font-bold tabular-nums text-stone-900 dark:text-stone-100">{value}</p>
      <p className="text-[10px] text-stone-500 dark:text-stone-400">{sub}</p>
    </div>
  );
}
