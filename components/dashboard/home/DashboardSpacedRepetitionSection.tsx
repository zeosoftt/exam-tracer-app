'use client';

import Link from 'next/link';
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { DashboardStats } from '@/components/dashboard/domain/dashboardTypes';

type SpacedRepetitionData = NonNullable<DashboardStats['spacedRepetition']>;

type DashboardSpacedRepetitionSectionProps = {
  spacedRepetition: SpacedRepetitionData;
  reviewAckTopicId: string | null;
  onAcknowledgeReview: (topicId: string) => void;
};

export function DashboardSpacedRepetitionSection({
  spacedRepetition,
  reviewAckTopicId,
  onAcknowledgeReview,
}: DashboardSpacedRepetitionSectionProps) {
  return (
    <section
      id="srs-section"
      className="mb-8 scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/80 sm:mb-10 sm:p-7"
      aria-labelledby="srs-heading"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400">
            <Brain className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h2 id="srs-heading" className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 sm:text-xl">
              Aralıklı tekrar
            </h2>
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              {spacedRepetition.scheduleExplanation}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:max-w-md sm:justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Geciken: {spacedRepetition.summary.overdue}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-3 py-1.5 text-xs font-semibold text-accent-900 dark:border-accent-900/40 dark:bg-accent-950/40 dark:text-accent-200">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
            7 gün içinde: {spacedRepetition.summary.dueWithinWeek}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
            <span className="h-1.5 w-1.5 rounded-full bg-stone-400" />
            Planlı: {spacedRepetition.summary.totalScheduled}
          </span>
        </div>
      </div>

      {spacedRepetition.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/80 px-4 py-8 text-center dark:border-stone-700 dark:bg-stone-950/40">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Tamamlanan konularınız oldukça burada sonraki tekrar tarihleri listelenir.
          </p>
        </div>
      ) : (
        <ul className="space-y-2 sm:space-y-3">
          {spacedRepetition.items.map((item) => (
            <li
              key={item.topicId}
              className={cn(
                'flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-950/50 sm:flex-row sm:items-center sm:justify-between',
                item.overdue && 'border-l-4 border-l-red-500',
                !item.overdue && item.daysUntil <= 1 && 'border-l-4 border-l-accent-500',
                !item.overdue && item.daysUntil > 1 && 'border-l-4 border-l-primary-400 dark:border-l-primary-600',
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-stone-900 dark:text-stone-100">{item.topicName}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {item.sectionName} · {item.subjectName}
                </p>
                <p className="mt-1 text-sm text-stone-700 dark:text-stone-300">
                  {item.overdue ? (
                    <span className="font-medium text-red-700 dark:text-red-400">Tekrar zamanı geldi veya geçti</span>
                  ) : item.daysUntil === 0 ? (
                    <span className="font-medium text-accent-800 dark:text-accent-400">Bugün tekrar önerilir</span>
                  ) : item.daysUntil === 1 ? (
                    <span>Yarın tekrar ({new Date(item.nextReviewAt).toLocaleDateString('tr-TR')})</span>
                  ) : (
                    <span>
                      ~{item.daysUntil} gün içinde tekrar (
                      {new Date(item.nextReviewAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                      )
                    </span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-lg bg-stone-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                  Seviye {item.level}
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
                  Konular
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
