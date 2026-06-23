'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Brain, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { SPACED_REPETITION_INTERVALS_DAYS } from '@/lib/utils/spacedRepetition';
import type { DashboardStats } from '@/components/dashboard/domain/dashboardTypes';

type SpacedRepetitionData = NonNullable<DashboardStats['spacedRepetition']>;
type ReviewItem = SpacedRepetitionData['items'][number];
type ReviewCategory = 'overdue' | 'soon' | 'upcoming';
type ReviewFilter = 'all' | 'overdue' | 'dueWithinWeek';

type DashboardSpacedRepetitionSectionProps = {
  spacedRepetition: SpacedRepetitionData;
  reviewAckTopicId: string | null;
  onAcknowledgeReview: (topicId: string) => void;
};

const LIST_PAGE_SIZE = 7;

const SUMMARY_FILTERS: Array<{ id: ReviewFilter; label: string }> = [
  { id: 'overdue', label: 'Geciken' },
  { id: 'dueWithinWeek', label: '7 gün içinde' },
  { id: 'all', label: 'Toplam plan' },
];

type ReviewTiming = {
  label: string;
  sublabel: string;
  priority: ReviewCategory;
};

function isDueWithinWeek(item: ReviewItem): boolean {
  return !item.overdue && item.daysUntil <= 7 && item.daysUntil >= 0;
}

function reviewTiming(item: ReviewItem): ReviewTiming {
  if (item.overdue) {
    return {
      label: 'Gecikmiş',
      sublabel: item.daysUntil < 0 ? `${Math.abs(item.daysUntil)} gün gecikti` : 'Tekrar zamanı geçti',
      priority: 'overdue',
    };
  }
  if (item.daysUntil === 0) {
    return { label: 'Bugün', sublabel: 'Bugün tekrar önerilir', priority: 'soon' };
  }
  if (item.daysUntil === 1) {
    return { label: 'Yarın', sublabel: 'Yarın tekrar önerilir', priority: 'soon' };
  }
  return {
    label: `${item.daysUntil} gün`,
    sublabel: new Date(item.nextReviewAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    priority: 'upcoming',
  };
}

function sortReviewItems(items: ReviewItem[]) {
  return [...items].sort((a, b) => {
    if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
    return a.daysUntil - b.daysUntil;
  });
}

const priorityDotClass = {
  overdue: 'bg-red-500 dark:bg-red-400',
  soon: 'bg-accent-500 dark:bg-accent-400',
  upcoming: 'bg-stone-300 dark:bg-stone-600',
} as const;

const priorityWhenClass = {
  overdue: 'text-red-700 dark:text-red-300',
  soon: 'text-accent-800 dark:text-accent-300',
  upcoming: 'text-stone-700 dark:text-stone-300',
} as const;

const filterActiveClass: Record<ReviewFilter, string> = {
  all: 'border-stone-400 bg-stone-100 text-stone-900 dark:border-stone-500 dark:bg-stone-800 dark:text-stone-100',
  overdue: 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200',
  dueWithinWeek:
    'border-accent-300 bg-accent-50 text-accent-900 dark:border-accent-800 dark:bg-accent-950/40 dark:text-accent-200',
};

function SummaryFilterButton({
  id,
  label,
  value,
  filter,
  onFilterChange,
}: {
  id: ReviewFilter;
  label: string;
  value: number;
  filter: ReviewFilter;
  onFilterChange: (filter: ReviewFilter) => void;
}) {
  const active = filter === id;

  return (
    <button
      type="button"
      onClick={() => onFilterChange(id)}
      aria-pressed={active}
      className={cn(
        'min-w-[5.5rem] rounded-xl border px-3 py-2.5 text-center transition-colors sm:text-left',
        active
          ? filterActiveClass[id]
          : 'border-stone-200 bg-white text-stone-900 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-950/50 dark:text-stone-100 dark:hover:bg-stone-900',
      )}
    >
      <p className="font-display text-xl font-bold tabular-nums tracking-tight sm:text-2xl">{value}</p>
      <p className={cn('mt-0.5 text-xs font-medium', active ? 'opacity-90' : 'text-stone-500 dark:text-stone-400')}>
        {label}
      </p>
    </button>
  );
}

function ScheduleExplanation({ scheduleExplanation }: { scheduleExplanation: string }) {
  return (
    <details className="group mt-4 rounded-xl border border-stone-200 bg-stone-50/80 dark:border-stone-700 dark:bg-stone-950/40">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-stone-700 marker:content-none dark:text-stone-300 [&::-webkit-details-marker]:hidden">
        Tekrar aralıkları nasıl çalışır?
        <ChevronDown className="h-4 w-4 shrink-0 text-stone-400 transition-transform group-open:rotate-180 dark:text-stone-500" aria-hidden />
      </summary>
      <div className="border-t border-stone-200 px-4 py-3 dark:border-stone-700">
        <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400">{scheduleExplanation}</p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {SPACED_REPETITION_INTERVALS_DAYS.map((days, index) => (
            <span key={days} className="inline-flex items-center gap-1.5">
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
  );
}

function ReviewRow({
  item,
  reviewAckTopicId,
  onAcknowledgeReview,
}: {
  item: ReviewItem;
  reviewAckTopicId: string | null;
  onAcknowledgeReview: (topicId: string) => void;
}) {
  const timing = reviewTiming(item);
  const isSaving = reviewAckTopicId === item.topicId;

  return (
    <li className="group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-stone-50/80 dark:hover:bg-stone-900/40 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className={cn('mt-2 h-2 w-2 shrink-0 rounded-full', priorityDotClass[timing.priority])}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-stone-900 dark:text-stone-100">{item.topicName}</p>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
            {item.sectionName} · {item.subjectName}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 pl-5 sm:pl-0">
        <div className="text-left sm:w-24 sm:text-right">
          <p className={cn('text-sm font-semibold tabular-nums', priorityWhenClass[timing.priority])}>{timing.label}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">{timing.sublabel}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-md bg-stone-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-600 dark:bg-stone-800 dark:text-stone-300 sm:inline-flex">
            Sv. {item.level}
          </span>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void onAcknowledgeReview(item.topicId)}
            className="btn btn-secondary whitespace-nowrap text-xs !px-3 !py-2"
          >
            {isSaving ? 'Kaydediliyor…' : 'Tekrar ettim'}
          </button>
          <Link
            href="/dashboard/detail"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Git →
          </Link>
        </div>
      </div>
    </li>
  );
}

function EmptyState({
  filter,
  onShowAll,
}: {
  filter: ReviewFilter;
  onShowAll?: () => void;
}) {
  const message =
    filter === 'all'
      ? 'Henüz planlanmış tekrar yok'
      : `${SUMMARY_FILTERS.find((option) => option.id === filter)?.label ?? 'Seçili'} kategorisinde tekrar yok`;

  return (
    <div className="px-5 py-12 text-center sm:px-6">
      <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-stone-300 dark:text-stone-600" aria-hidden />
      <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{message}</p>
      {filter === 'all' ? (
        <>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Konuları tamamladıkça sonraki tekrar tarihleri burada listelenir.
          </p>
          <Link href="/dashboard/detail" className="btn btn-primary mt-5 inline-flex text-sm">
            Konulara git
          </Link>
        </>
      ) : (
        <button
          type="button"
          onClick={onShowAll}
          className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          Tüm tekrarları göster
        </button>
      )}
    </div>
  );
}

export function DashboardSpacedRepetitionSection({
  spacedRepetition,
  reviewAckTopicId,
  onAcknowledgeReview,
}: DashboardSpacedRepetitionSectionProps) {
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [showAllItems, setShowAllItems] = useState(false);

  function handleFilterChange(next: ReviewFilter) {
    setFilter(next);
    setShowAllItems(false);
  }

  const sortedItems = useMemo(() => sortReviewItems(spacedRepetition.items), [spacedRepetition.items]);

  const counts = useMemo(
    () => ({
      all: spacedRepetition.summary.totalScheduled,
      overdue: spacedRepetition.summary.overdue,
      dueWithinWeek: spacedRepetition.summary.dueWithinWeek,
    }),
    [spacedRepetition.summary],
  );

  const filteredItems = useMemo(() => {
    if (filter === 'all') return sortedItems;
    if (filter === 'overdue') return sortedItems.filter((item) => item.overdue);
    return sortedItems.filter((item) => isDueWithinWeek(item));
  }, [filter, sortedItems]);

  const { visibleItems, hiddenCount } = useMemo(() => {
    if (showAllItems || filteredItems.length <= LIST_PAGE_SIZE) {
      return { visibleItems: filteredItems, hiddenCount: 0 };
    }

    return {
      visibleItems: filteredItems.slice(0, LIST_PAGE_SIZE),
      hiddenCount: filteredItems.length - LIST_PAGE_SIZE,
    };
  }, [filteredItems, showAllItems]);

  const hasItems = spacedRepetition.items.length > 0;

  return (
    <section
      id="srs-section"
      className="mb-8 scroll-mt-24 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/80 sm:mb-10"
      aria-labelledby="srs-heading"
    >
      <div className="border-b border-stone-100 px-5 py-4 dark:border-stone-800 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800">
              <Brain className="h-5 w-5 text-stone-600 dark:text-stone-300" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="srs-heading" className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 sm:text-xl">
                Aralıklı tekrar
              </h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                Tamamlanan konular için unutma eğrisine göre planlanmış tekrar hatırlatmaları
              </p>
              {spacedRepetition.summary.overdue > 0 && (
                <p className="mt-2 text-sm font-medium text-red-700 dark:text-red-300">
                  {spacedRepetition.summary.overdue} konunun tekrarı gecikmiş — önce bunları tamamlayın.
                </p>
              )}

              <ScheduleExplanation scheduleExplanation={spacedRepetition.scheduleExplanation} />
            </div>
          </div>

          {hasItems && (
            <div
              className="flex flex-wrap gap-2 border-t border-stone-100 pt-4 sm:border-t-0 sm:pt-0 sm:pl-2"
              role="group"
              aria-label="Tekrar filtresi"
            >
              {SUMMARY_FILTERS.map((option) => (
                <SummaryFilterButton
                  key={option.id}
                  id={option.id}
                  label={option.label}
                  value={counts[option.id]}
                  filter={filter}
                  onFilterChange={handleFilterChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {!hasItems ? (
        <EmptyState filter="all" />
      ) : visibleItems.length === 0 ? (
        <EmptyState filter={filter} onShowAll={() => handleFilterChange('all')} />
      ) : (
        <div>
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {visibleItems.map((item) => (
              <ReviewRow
                key={item.topicId}
                item={item}
                reviewAckTopicId={reviewAckTopicId}
                onAcknowledgeReview={onAcknowledgeReview}
              />
            ))}
          </ul>

          {hiddenCount > 0 && (
            <div className="border-t border-stone-100 px-5 py-3 dark:border-stone-800 sm:px-6">
              <button
                type="button"
                onClick={() => setShowAllItems((open) => !open)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {showAllItems ? (
                  <>
                    <ChevronUp className="h-4 w-4" aria-hidden />
                    Listeyi daralt
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" aria-hidden />
                    {hiddenCount} tekrarı daha göster
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
