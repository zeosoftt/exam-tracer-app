'use client';

import { CheckCircle, RefreshCw, Target, TrendingUp } from 'lucide-react';
import type { DetailData } from '@/components/dashboard/detail/dashboardDetailTypes';

type EvaluationInfo = NonNullable<DetailData['evaluation']>;

type DashboardDetailEvaluationBannerProps = {
  evaluation: EvaluationInfo;
};

export function DashboardDetailEvaluationBanner({ evaluation }: DashboardDetailEvaluationBannerProps) {
  return (
    <div className="mb-4 rounded-xl border border-primary-200 bg-gradient-to-br bg-primary-50 p-4 shadow-sm dark:border-primary-900/40 dark:bg-primary-950/25 sm:mb-6 sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex-shrink-0 rounded-lg bg-white p-2 shadow-sm dark:bg-stone-800">
            <Target className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="min-w-0">
            <h5 className="text-sm font-bold text-stone-900 dark:text-stone-100">Hedef Puan Temelli Değerlendirme</h5>
            <p className="mt-0.5 break-words text-xs text-stone-600 dark:text-stone-400">
              Hedef: {evaluation.targetScore}/100 · Gerekli Net: {evaluation.requiredNet?.toFixed(1) || '-'} · Başarı:{' '}
              {evaluation.requiredSuccessRate ? (evaluation.requiredSuccessRate * 100).toFixed(1) : '-'}%
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-300">
            <CheckCircle className="h-3 w-3 flex-shrink-0" />
            İYİ ≥%95
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-2 py-1.5 text-xs font-semibold text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300">
            <TrendingUp className="h-3 w-3 flex-shrink-0" />
            GELİŞTİRİLEBİLİR ≥%80
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-1.5 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
            <RefreshCw className="h-3 w-3 flex-shrink-0" />
            TEKRAR &lt;%80
          </div>
        </div>
      </div>
    </div>
  );
}
