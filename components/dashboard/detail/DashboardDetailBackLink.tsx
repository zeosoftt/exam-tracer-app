'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function DashboardDetailBackLink() {
  return (
    <Link
      href="/dashboard"
      className="group mb-4 inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 sm:mb-8"
    >
      <div className="rounded-lg bg-stone-100 p-1.5 transition-colors group-hover:bg-stone-200 dark:bg-stone-800 dark:group-hover:bg-stone-700">
        <ArrowLeft className="h-4 w-4" />
      </div>
      <span className="sm:inline">Özet Ekrana Dön</span>
    </Link>
  );
}
