/** Net vs ortalama trend — sunucu/istemci kart paylaşımı (CLS/LCP). */

export type NetTrendVariant = 'up' | 'down' | 'avg';

export type NetTrendState = {
  variant: NetTrendVariant;
  diff: number;
  label: string;
  diffLabel: string;
};

export function getNetTrendState(net: number, avgNet: number): NetTrendState {
  const diff = net - avgNet;
  const threshold = 1.5;

  if (diff >= threshold) {
    return { variant: 'up', diff, label: 'Yükseliş', diffLabel: `+${diff.toFixed(1)} net` };
  }
  if (diff <= -threshold) {
    return { variant: 'down', diff, label: 'Düşüş', diffLabel: `${diff.toFixed(1)} net` };
  }
  return {
    variant: 'avg',
    diff,
    label: 'Ortalama',
    diffLabel: diff >= 0 ? `+${diff.toFixed(1)} net` : `${diff.toFixed(1)} net`,
  };
}

export const trendStripeClass: Record<NetTrendVariant, string> = {
  up: 'border-l-emerald-500',
  down: 'border-l-red-500',
  avg: 'border-l-amber-400',
};

export const trendNetBgClass: Record<NetTrendVariant, string> = {
  up: 'from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25',
  down: 'from-red-500 to-red-600 text-white shadow-red-500/25',
  avg: 'from-amber-400 to-amber-500 text-amber-950 shadow-amber-400/25',
};

export const trendBadgeClass: Record<NetTrendVariant, string> = {
  up: 'border-emerald-300 bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-100 dark:ring-emerald-400/25',
  down: 'border-red-300 bg-red-50 text-red-800 ring-red-600/20 dark:border-red-700 dark:bg-red-950/80 dark:text-red-100 dark:ring-red-400/25',
  avg: 'border-amber-300 bg-amber-50 text-amber-900 ring-amber-600/20 dark:border-amber-700 dark:bg-amber-950/80 dark:text-amber-100 dark:ring-amber-400/25',
};
