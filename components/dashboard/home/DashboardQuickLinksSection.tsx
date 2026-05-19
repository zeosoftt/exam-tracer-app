'use client';

import { BarChart3, ClipboardList, Settings, Timer } from 'lucide-react';
import { QuickLinkCard } from '@/components/ui';

const QUICK_LINKS = [
  {
    href: '/dashboard/detail',
    title: 'Konu detayı',
    description: 'Ders ve konu ilerlemesini güncelleyin',
    icon: <BarChart3 className="h-5 w-5" aria-hidden />,
    accent: 'primary' as const,
  },
  {
    href: '/dashboard/deneme',
    title: 'Deneme takibi',
    description: 'Deneme kayıtları ve net trendi',
    icon: <ClipboardList className="h-5 w-5" aria-hidden />,
    accent: 'accent' as const,
  },
  {
    href: '/dashboard/pomodoro',
    title: 'Pomodoro',
    description: 'Odaklanma seansları ve istatistik',
    icon: <Timer className="h-5 w-5" aria-hidden />,
    accent: 'violet' as const,
  },
  {
    href: '/dashboard/settings',
    title: 'Ayarlar',
    description: 'Tema, hedef puan ve hesap',
    icon: <Settings className="h-5 w-5" aria-hidden />,
    accent: 'stone' as const,
  },
];

export function DashboardQuickLinksSection() {
  return (
    <section className="mt-10 sm:mt-12" aria-labelledby="quick-links-heading">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 id="quick-links-heading" className="font-display text-base font-bold text-stone-900 dark:text-stone-100 sm:text-lg">
            Sayfalar
          </h2>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 sm:text-sm">
            Aynı düzeni ayarlarda da bulabilirsiniz; burada tek tıkla geçiş
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <QuickLinkCard key={link.href} {...link} />
        ))}
      </div>
    </section>
  );
}
