'use client';

import { CreditCard, Loader2 } from 'lucide-react';
import { PageSectionCard } from '@/components/ui';
import type { SettingsPageState } from '@/components/settings/hooks/useSettingsPage';
import { MARKETING_TOUCHPOINTS } from '@/lib/marketing/touchpoints';
import { FreeUserUpgradeInline } from '@/components/dashboard/FreeUserUpgradeBanner';

type SettingsPlanSectionProps = Pick<SettingsPageState, 'planInfo' | 'planLoading' | 'email'>;

export function SettingsPlanSection({ planInfo, planLoading, email }: SettingsPlanSectionProps) {
  return (
    <PageSectionCard
      title="Plan ve Faturalandırma"
      icon={<CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
      iconClassName="bg-emerald-100 dark:bg-emerald-950/40"
    >
      {planLoading ? (
        <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span>Plan bilgisi yükleniyor...</span>
        </div>
      ) : planInfo ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-stone-900 dark:text-stone-100">{planInfo.planName}</span>
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              {planInfo.planType}
            </span>
            {planInfo.subscriptionStatus === 'ACTIVE' ? (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-950/50 dark:text-green-300">
                Aktif
              </span>
            ) : null}
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {planInfo.planCode === 'FREE'
              ? 'Sadece temel takip: sınav listesi, konu ilerlemesi ve basit dashboard.'
              : 'Raporlar, dışa aktarma ve gelişmiş analitik dahil.'}
          </p>
          {planInfo.planCode === 'FREE' ? (
            <FreeUserUpgradeInline userEmail={email} touchpoint={MARKETING_TOUCHPOINTS.SETTINGS_PLAN} />
          ) : null}
          {planInfo.limits.length > 0 ? (
            <ul className="space-y-1 text-sm text-stone-600 dark:text-stone-400">
              {planInfo.limits.map((l) => (
                <li key={l.resourceType}>
                  {l.resourceType === 'EXAMS' && `Sınav: ${l.current} / ${l.limit}`}
                  {l.resourceType === 'STUDENTS' && `Öğrenci: ${l.current} / ${l.limit}`}
                  {l.resourceType === 'USERS' && `Kullanıcı: ${l.current} / ${l.limit}`}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-stone-500 dark:text-stone-400">Plan bilgisi alınamadı.</p>
      )}
    </PageSectionCard>
  );
}
