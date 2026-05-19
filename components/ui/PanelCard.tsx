import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { panelCardClass } from '@/lib/ui/pageStyles';

type PanelCardProps = {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md';
};

export function PanelCard({ children, className, padding = 'md' }: PanelCardProps) {
  return <div className={cn(panelCardClass, padding === 'sm' ? 'p-4' : 'p-6', className)}>{children}</div>;
}
