'use client';

import { Plus } from 'lucide-react';

export const DENEME_OPEN_ADD_EVENT = 'deneme:open-add';

export function DenemeAddButtonTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(DENEME_OPEN_ADD_EVENT))}
      className="btn btn-primary gap-2"
    >
      <Plus className="h-4 w-4" />
      Yeni deneme ekle
    </button>
  );
}
