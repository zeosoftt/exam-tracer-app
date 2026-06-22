'use client';

import Link from 'next/link';
import { AlertCircle, Brain, CalendarClock, CheckCircle2 } from 'lucide-react';
import { SectionIconHeader } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { SPACED_REPETITION_INTERVALS_DAYS } from '@/lib/utils/spacedRepetition';
import type { DashboardStats } from '@/components/dashboard/domain/dashboardTypes';

type SpacedRepetitionData = NonNullable<DashboardStats['spacedRepetition']>;
type ReviewItem = SpacedRepetitionData['items'][number];

type DashboardSpacedRepetitionSectionProps = {
  spacedRepetition: SpacedRepetitionData;
  reviewAckTopicId: string | null;
  onAcknowledgeReview: (topicId: string) => void;
};

function reviewStatus(item: ReviewItem) {
  if (item.overdue) {
    return {
      label: 'Gecikmiş',
      detail: 'Tekrar zamanı geldi veya geçti',
      tone: 'red' as const,
    };
  }
  if (item.daysUntil === 0) {
    return {
      label: 'Bugün',
      detail: 'Bugün tekrar önerilir',
      tone: 'accent' as const,
    };
  }
  if (item.daysUntil === 1) {
    return {
      label: 'Yarın',
      detail: `Yarın (${new Date(item.nextReviewAt).toLocaleDateString('tr-TR')})`,
      tone: 'accent' as const,
    };
  }
  return {
    label: `${item.daysUntil} gün`,
    detail: new Date(item.nextReviewAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    tone: 'primary' as const,
  };
}

const toneStyles = {
  red: {
    badge: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200',
    row: 'border-l-red-500 bg-red-50/40 dark:bg-red-950/10',
  },
  accent: {
    badge: 'bg-accent-100 text-accent-900 dark:bg-accent-950/50 dark:text-accent-200',
    row: 'border-l-accent-500 bg-accent-50/30 dark:bg-accent-950/10',
  },
  primary: {
    badge: 'bg-primary-100 text-primary-800 dark:bg-primary-950/50 dark:text-primary-200',
    row: 'border-l-primary-400 dark:border-l-primary-600',
  },
};

function ReviewItemRow({
  item,
  reviewAckTopicId,
  onAcknowledgeReview,
}: {
  item: ReviewItem;
  reviewAckTopicId: string | null;
  onAcknowledgeReview: (topicId: string) => void;
}) {
  const status = reviewStatus(item);
  const styles = toneStyles[status.tone];

  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-stone-200 border-l-4 bg-white p-3.5 dark:border-stone-700 dark:bg-stone-950/50 sm:flex-row sm:items-center sm:justify-between sm:p-4',
        styles.row,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-stone-900 dark:text-stone-100">{item.topicName}</p>
          <span className={cn('inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', styles.badge)}>
            {status.label}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
          {item.sectionName} · {item.subjectName}
        </p>
        <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">{status.detail}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
        <span className="inline-flex items-center rounded-lg bg-stone-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-600 dark:bg-stone-800 dark:text-stone-300">
          Sv. {item.level}
        </span>
        <button
          type="button"
          disabled={reviewAckTopicId === item.topicId}
          onClick={() => void onAcknowledgeReview(item.topicId)}
          className="btn btn-secondary text-xs !px-3 !py-2"
        >
          {reviewAckTopicId === item.topicId ? 'Kaydediliyor…' : 'Tekrar ettim'}
        </button>
        <Link href="/dashboard/detail" className="btn btn-primary text-xs !px-3 !py-2">
          Konuya git
        </Link>
      </div>
    </li>
  );
}

function ReviewGroup({
  title,
  items,
  reviewAckTopicId,
  onAcknowledgeReview,
}: {
  title: string;
  items: ReviewItem[];
  reviewAckTopicId: string | null;
  onAcknowledgeReview: (topicId: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <ReviewItemRow
            key={item.topicId}
            item={item}
            reviewAckTopicId={reviewAckTopicId}
            onAcknowledgeReview={onAcknowledgeReview}
          />
        ))}
      </ul>
    </div>
  );
}

export function DashboardSpacedRepetitionSection({
  spacedRepetition,
  reviewAckTopicId,
  onAcknowledgeReview,
}: DashboardSpacedRepetitionSectionProps) {
  const overdueItems = spacedRepetition.items.filter((item) => item.overdue);
  const dueSoonItems = spacedRepetition.items.filter((item) => !item.overdue && item.daysUntil <= 1);
  const upcomingItems = spacedRepetition.items.filter((item) => !item.overdue && item.daysUntil > 1);

  return (
    <section
      id="srs-section"
      className="mb-8 scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/80 sm:mb-10 sm:p-6"
      aria-labelledby="srs-heading"
    >
      {spacedRepetition.summary.overdue > 0 && (
        <div
          className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/30"
          role="status"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden />
          <p className="text-sm font-medium text-red-900 dark:text-red-100">
            {spacedRepetition.summary.overdue} konunun tekrarı gecikmiş — önce bunları tamamlamanız önerilir.
          </p>
        </div>
      )}

      <SectionIconHeader
        className="mb-4"
        icon={<Brain className="h-5 w-5 text-primary-700 dark:text-primary-300" aria-hidden />}
        iconWrapperClassName="rounded-xl bg-primary-100 dark:bg-primary-950"
        title="Aralıklı tekrar"
        titleId="srs-heading"
        description="Tamamlanan konular için unutma eğrisine göre planlanmış tekrar hatırlatmaları"
      />

      <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-red-200/80 bg-red-50/80 px-3 py-2.5 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <p className="text-lg font-bold tabular-nums text-red-800 dark:text-red-200">{spacedRepetition.summary.overdue}</p>
          <p className="text-[11px] font-medium text-red-700/90 dark:text-red-300/90">Geciken</p>
        </div>
        <div className="rounded-xl border border-accent-200/80 bg-accent-50/80 px-3 py-2.5 text-center dark:border-accent-900/40 dark:bg-accent-950/20">
          <p className="text-lg font-bold tabular-nums text-accent-900 dark:text-accent-200">
            {spacedRepetition.summary.dueWithinWeek}
          </p>
          <p className="text-[11px] font-medium text-accent-800/90 dark:text-accent-300/90">7 gün içinde</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-center dark:border-stone-700 dark:bg-stone-800/60">
          <p className="text-lg font-bold tabular-nums text-stone-900 dark:text-stone-100">
            {spacedRepetition.summary.totalScheduled}
          </p>
          <p className="text-[11px] font-medium text-stone-600 dark:text-stone-400">Toplam plan</p>
        </div>
      </div>

      <details className="group mb-5 rounded-xl border border-stone-200 bg-stone-50/80 dark:border-stone-700 dark:bg-stone-950/40">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-stone-800 marker:content-none dark:text-stone-200 [&::-webkit-details-marker]:hidden">
          <CalendarClock className="h-4 w-4 text-stone-500 dark:text-stone-400" aria-hidden />
          Tekrar aralıkları nasıl çalışır?
        </summary>
        <div className="border-t border-stone-200 px-4 py-3 dark:border-stone-700">
          <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">{spacedRepetition.scheduleExplanation}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1">
            {SPACED_REPETITION_INTERVALS_DAYS.map((days, index) => (
              <span key={days} className="inline-flex items-center gap-1">
                <span className="inline-flex rounded-md bg-white px-2 py-1 text-xs font-semibold text-stone-700 ring-1 ring-stone-200 dark:bg-stone-900 dark:text-stone-200 dark:ring-stone-700">
                  {days} gün
                </span>
                {index < SPACED_REPETITION_INTERVALS_DAYS.length - 1 ? (
                  <span className="text-xs text-stone-400 dark:text-stone-500" aria-hidden>
                    →
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        </div>
      </details>

      {spacedRepetition.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/80 px-4 py-10 text-center dark:border-stone-700 dark:bg-stone-950/40">
          <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-stone-300 dark:text-stone-600" aria-hidden />
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Henüz planlanmış tekrar yok</p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Konuları tamamladıkça sonraki tekrar tarihleri burada listelenir.
          </p>
          <Link href="/dashboard/detail" className="btn btn-primary mt-4 inline-flex text-sm">
            Konulara git
          </Link>
        </div>
      ) : (
        <div className="custom-scrollbar max-h-[min(32rem,70vh)] space-y-5 overflow-y-auto pr-0.5">
          <ReviewGroup
            title="Geciken"
            items={overdueItems}
            reviewAckTopicId={reviewAckTopicId}
            onAcknowledgeReview={onAcknowledgeReview}
          />
          <ReviewGroup
            title="Bugün ve yarın"
            items={dueSoonItems}
            reviewAckTopicId={reviewAckTopicId}
            onAcknowledgeReview={onAcknowledgeReview}
          />
          <ReviewGroup
            title="Yaklaşan tekrarlar"
            items={upcomingItems}
            reviewAckTopicId={reviewAckTopicId}
            onAcknowledgeReview={onAcknowledgeReview}
          />
        </div>
      )}
    </section>
  );
}
