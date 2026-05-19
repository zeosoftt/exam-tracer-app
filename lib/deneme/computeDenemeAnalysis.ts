import type { DenemeAttemptListItem } from '@/lib/client-api/denemeClient';

export type DenemeAnalysis = {
  total: number;
  avg: number;
  max: number;
  min: number;
  avgLast5: number | null;
  avgPrev5: number | null;
  trend: 'up' | 'down' | 'stable';
  chartData: Array<{ attemptedAt: string; netScore: number; examName: string }>;
  chartMin: number;
  chartRange: number;
};

export function computeDenemeAnalysis(attempts: DenemeAttemptListItem[]): DenemeAnalysis | null {
  const withNet = attempts.filter((a) => a.netScore != null) as Array<
    DenemeAttemptListItem & { netScore: number }
  >;
  if (withNet.length === 0) {
    return null;
  }

  const nets = withNet.map((a) => a.netScore);
  const sum = nets.reduce((s, n) => s + n, 0);
  const avg = sum / nets.length;
  const max = Math.max(...nets);
  const min = Math.min(...nets);
  const sortedByDate = [...withNet].sort(
    (a, b) => new Date(a.attemptedAt).getTime() - new Date(b.attemptedAt).getTime(),
  );
  const last5 = sortedByDate.slice(-5);
  const prev5 = sortedByDate.slice(-10, -5);
  const avgLast5 = last5.length ? last5.reduce((s, a) => s + a.netScore, 0) / last5.length : null;
  const avgPrev5 = prev5.length ? prev5.reduce((s, a) => s + a.netScore, 0) / prev5.length : null;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (avgLast5 != null && avgPrev5 != null) {
    const diff = avgLast5 - avgPrev5;
    if (diff > 0.5) trend = 'up';
    else if (diff < -0.5) trend = 'down';
  }

  const chartData = sortedByDate.slice(-20).map((a) => ({
    attemptedAt: a.attemptedAt,
    netScore: a.netScore,
    examName: a.exam.name,
  }));
  const chartMin = Math.min(...chartData.map((d) => d.netScore));
  const chartMax = Math.max(...chartData.map((d) => d.netScore));
  const chartRange = chartMax - chartMin || 1;

  return {
    total: withNet.length,
    avg,
    max,
    min,
    avgLast5,
    avgPrev5,
    trend,
    chartData,
    chartMin,
    chartRange,
  };
}

export function formatDenemeDate(value: string): string {
  return new Date(value).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
