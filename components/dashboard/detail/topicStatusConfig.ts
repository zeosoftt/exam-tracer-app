import { CheckCircle, Circle, PlayCircle, type LucideIcon } from 'lucide-react';

export type TopicStatusValue = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type TopicStatusConfig = {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  iconBg: string;
  dotColor: string;
  value: TopicStatusValue;
};

export function getTopicStatusConfig(status: string): TopicStatusConfig {
  switch (status) {
    case 'COMPLETED':
      return {
        icon: CheckCircle,
        color: 'text-green-700 dark:text-green-300',
        bgColor: 'bg-green-50 dark:bg-green-950/25',
        borderColor: 'border-green-200 dark:border-green-900/50',
        label: 'Tamamlandı',
        iconBg: 'bg-green-100 dark:bg-green-950/40',
        dotColor: 'bg-green-500',
        value: 'COMPLETED',
      };
    case 'IN_PROGRESS':
      return {
        icon: PlayCircle,
        color: 'text-yellow-700 dark:text-yellow-300',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
        borderColor: 'border-yellow-200 dark:border-yellow-900/50',
        label: 'Devam Ediyor',
        iconBg: 'bg-yellow-100 dark:bg-yellow-950/40',
        dotColor: 'bg-yellow-500',
        value: 'IN_PROGRESS',
      };
    default:
      return {
        icon: Circle,
        color: 'text-stone-500 dark:text-stone-400',
        bgColor: 'bg-stone-50 dark:bg-stone-900/40',
        borderColor: 'border-stone-200 dark:border-stone-700',
        label: 'Başlanmadı',
        iconBg: 'bg-stone-100 dark:bg-stone-800',
        dotColor: 'bg-stone-400',
        value: 'NOT_STARTED',
      };
  }
}
