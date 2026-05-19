import Link from 'next/link';
import { LifeBuoy } from 'lucide-react';

export function SettingsSupportBanner() {
  return (
    <Link
      href="/destek"
      className="mb-8 flex items-center gap-3 rounded-2xl border border-primary-200 bg-primary-50/90 p-4 text-left transition-colors hover:border-primary-300 hover:bg-primary-50 dark:border-primary-900/50 dark:bg-primary-950/30 dark:hover:border-primary-800"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white">
        <LifeBuoy className="h-5 w-5" aria-hidden />
      </span>
      <span>
        <span className="block text-sm font-bold text-stone-900 dark:text-stone-100">Sorun mu yaşıyorsunuz?</span>
        <span className="mt-0.5 block text-xs text-stone-600 dark:text-stone-400">
          Destek ekibine yazın — teknik sorun, hesap veya geri bildirim.
        </span>
      </span>
    </Link>
  );
}
