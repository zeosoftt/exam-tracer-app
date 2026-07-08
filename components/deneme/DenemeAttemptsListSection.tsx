'use client';

import { Target } from 'lucide-react';
import { DenemeAttemptCardServer } from '@/components/deneme/DenemeAttemptCardServer';
import { sortDenemeAttemptsByDateDesc } from '@/lib/deneme/sortDenemeAttempts';
import { useDenemePageContext } from '@/components/deneme/DenemePageContext';

export function DenemeAttemptsListSection() {
  const {
    attempts,
    analysisAvg,
    canViewDenemeDetail,
    featuresEnabled,
    topicProgressByExam,
    loading,
    listError,
  } = useDenemePageContext();

  const sortedAttempts = sortDenemeAttemptsByDateDesc(attempts);

  if (loading && sortedAttempts.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white px-6 py-10 text-center dark:border-stone-800 dark:bg-stone-900/80">
        <p className="text-sm text-stone-500 dark:text-stone-400">Deneme kayıtları yükleniyor…</p>
      </div>
    );
  }

  if (listError && sortedAttempts.length === 0) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center dark:border-red-900/40 dark:bg-red-950/30">
        <p className="text-sm text-red-700 dark:text-red-300">{listError}</p>
      </div>
    );
  }

  if (sortedAttempts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center dark:border-stone-600 dark:bg-stone-900/80">
        <Target className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600" />
        <p className="mt-4 font-medium text-stone-700 dark:text-stone-300">Henüz deneme kaydı yok</p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {featuresEnabled
            ? 'Yukarıdaki “Deneme ekle” kartından kurum linki veya manuel kayıt ile deneme ekleyin.'
            : 'Yeni kayıt ekleme şu an kapalı.'}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {sortedAttempts.map((attempt) => (
        <DenemeAttemptCardServer
          key={attempt.id}
          attempt={attempt}
          avgNet={analysisAvg}
          canViewDetail={canViewDenemeDetail}
          featuresEnabled={featuresEnabled}
          topicPct={topicProgressByExam[attempt.examId]?.pct}
        />
      ))}
    </ul>
  );
}
