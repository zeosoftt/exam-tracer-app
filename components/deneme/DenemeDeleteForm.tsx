'use client';

import { useTransition } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { deleteDenemeAttemptAction } from '@/app/(dashboard)/dashboard/deneme/actions';

export function DenemeDeleteForm({ attemptId }: { attemptId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm('Bu deneme kaydını silmek istediğinize emin misiniz?')) return;
        startTransition(() => {
          void deleteDenemeAttemptAction(attemptId);
        });
      }}
      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 dark:hover:border-red-800 dark:hover:bg-red-950/50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
      Denemeyi sil
    </button>
  );
}
