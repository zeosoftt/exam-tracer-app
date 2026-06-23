'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export const DENEME_OPEN_ADD_EVENT = 'deneme:open-add';

export function DenemeAddButtonTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(DENEME_OPEN_ADD_EVENT))}
      className={cn('btn btn-primary w-full gap-2 sm:w-auto', className)}
    >
      <Plus className="h-4 w-4" />
      Yeni deneme ekle
    </button>
  );
}
