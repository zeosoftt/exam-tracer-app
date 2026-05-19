'use client';

import { BookOpen } from 'lucide-react';
import { EmptyStateCard } from '@/components/ui';

export function DashboardDetailEmptyState() {
  return (
    <EmptyStateCard
      icon={BookOpen}
      title="Aktif sınav bulunamadı"
      description="Detaylı istatistikler için bir sınava kayıt olmanız gerekiyor."
    />
  );
}
