/**
 * Pomodoro Timer Page
 * Odaklı çalışma zamanlayıcısı - Backend entegreli
 */

'use client';

import { Timer } from 'lucide-react';
import { SubAppPageHeader } from '@/components/ui';
import { usePomodoroPage } from '@/components/pomodoro/hooks/usePomodoroPage';
import { PomodoroTimerTabNav } from '@/components/pomodoro/PomodoroTimerTabNav';
import { PomodoroTimerPanel } from '@/components/pomodoro/PomodoroTimerPanel';
import { DenemePracticeTimerPanel } from '@/components/pomodoro/DenemePracticeTimerPanel';
import { PomodoroSidebar } from '@/components/pomodoro/PomodoroSidebar';

export default function PomodoroPageClient() {
  const page = usePomodoroPage();

  return (
    <div className="flex min-h-dvh flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 lg:h-dvh lg:overflow-hidden">
      <SubAppPageHeader
        title="Pomodoro"
        icon={<Timer className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden />}
        className="shrink-0"
      />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6 lg:min-h-0 lg:overflow-hidden lg:px-8 lg:py-5">
        <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-3 lg:items-stretch lg:gap-5">
          <div className="flex min-h-[24rem] flex-col lg:col-span-2 lg:min-h-0">
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-lg dark:border-stone-800 dark:bg-stone-900/90 lg:flex-row">
              <PomodoroTimerTabNav timerTab={page.timerTab} onTabChange={page.setTimerTab} />

              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {page.timerTab === 'pomodoro' && <PomodoroTimerPanel {...page} />}
                {page.timerTab === 'deneme' && <DenemePracticeTimerPanel {...page} />}
              </div>
            </div>
          </div>

          <PomodoroSidebar isLoading={page.isLoading} stats={page.stats} history={page.history} />
        </div>
      </main>
    </div>
  );
}
