import Link from 'next/link';
import { Lock, Sparkles, Target } from 'lucide-react';
import { SHOPIER_CHECKOUT_URL } from '@/config/constants';
import { pageIntroClass } from '@/lib/ui/pageStyles';
import { computeDenemeAnalysis } from '@/lib/deneme/computeDenemeAnalysis';
import type { DenemePageInitialData } from '@/lib/deneme/loadDenemePageData';
import { DenemeAttemptCardServer } from '@/components/deneme/DenemeAttemptCardServer';
import { DenemeAddButtonTrigger } from '@/components/deneme/DenemeAddButtonTrigger';

type DenemePageStaticContentProps = {
  data: DenemePageInitialData;
};

export function DenemePageStaticContent({ data }: DenemePageStaticContentProps) {
  const analysisAvg = computeDenemeAnalysis(data.attempts)?.avg ?? null;
  const showPremiumBanner = data.denemeAdvanced && !data.canViewDenemeDetail;
  const featuresEnabled = data.denemeAdvanced;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="shrink-0 text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            ← Geri
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
            <Target className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
            <h1 className="truncate text-xl font-bold text-stone-900 dark:text-stone-100">Deneme Takibi</h1>
          </div>
          <div className="w-12 shrink-0" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <p className={pageIntroClass}>
          Deneme kayıtlarınızı girin, net trendinizi ve konu ilerlemenizi takip edin.
        </p>

        {data.denemeAdvanced === false ? (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            <p className="font-medium">Gelişmiş deneme özellikleri şu an kapalı.</p>
            <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
              Deneme analizi ve yeni kayıt formu şu an kullanılamıyor.
            </p>
          </div>
        ) : null}

        {showPremiumBanner ? (
          <div className="mb-6 min-h-[9.5rem] rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-6 shadow-lg dark:border-amber-900/40 dark:from-amber-950/40 dark:to-orange-950/30">
            <div className="mb-3 flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Deneme detayı Premium&apos;da</h2>
            </div>
            <p className="mb-4 text-sm text-stone-600 dark:text-stone-400">
              Deneme listesi ve yeni kayıt ücretsizdir. Ders bazlı sonuçlar ve konu analizi için Premium plan gerekir.
            </p>
            <a
              href={SHOPIER_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600"
            >
              <Sparkles className="h-4 w-4" />
              Pro&apos;yu Shopier&apos;da satın al
            </a>
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Deneme kayıtları</h2>
          {featuresEnabled ? <DenemeAddButtonTrigger /> : null}
        </div>

        {data.attempts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center dark:border-stone-600 dark:bg-stone-900/80">
            <Target className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600" />
            <p className="mt-4 font-medium text-stone-700 dark:text-stone-300">Henüz deneme kaydı yok</p>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {featuresEnabled
                ? 'İlk denemenizi ekleyerek net trendinizi takip etmeye başlayın.'
                : 'Yeni kayıt ekleme şu an kapalı.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {data.attempts.map((attempt) => (
              <DenemeAttemptCardServer
                key={attempt.id}
                attempt={attempt}
                avgNet={analysisAvg}
                canViewDetail={data.canViewDenemeDetail}
                featuresEnabled={featuresEnabled}
                topicPct={data.topicProgressByExam[attempt.examId]?.pct}
              />
            ))}
          </ul>
        )}

      </main>
    </div>
  );
}
