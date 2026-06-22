export type NetChartPoint = {
  attemptedAt: string;
  netScore: number;
  examName: string;
};

export function computeChartBounds(values: number[]): { chartMin: number; chartRange: number } {
  if (values.length === 0) {
    return { chartMin: 0, chartRange: 1 };
  }

  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const rawRange = rawMax - rawMin;
  const padding = rawRange > 0 ? Math.max(rawRange * 0.15, 1.5) : 2;

  const chartMin = rawMin - padding;
  const chartMax = rawMax + padding;
  return { chartMin, chartRange: chartMax - chartMin || 1 };
}

export function buildYTicks(chartMin: number, chartRange: number, tickCount = 4): number[] {
  const ticks: number[] = [];
  for (let i = 0; i <= tickCount; i++) {
    ticks.push(chartMin + (chartRange * i) / tickCount);
  }
  return ticks;
}

export function netToPlotY(
  netScore: number,
  chartMin: number,
  chartRange: number,
  plotTop: number,
  plotHeight: number,
): number {
  const ratio = chartRange > 0 ? (netScore - chartMin) / chartRange : 0.5;
  return plotTop + plotHeight * (1 - ratio);
}

export function indexToPlotX(index: number, pointCount: number, plotLeft: number, plotWidth: number): number {
  if (pointCount <= 1) return plotLeft + plotWidth / 2;
  return plotLeft + (plotWidth * index) / (pointCount - 1);
}

/** Yumuşak çizgi — kontrol noktaları orta x üzerinden */
export function buildSmoothLinePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

export function buildAreaPath(
  linePath: string,
  points: Array<{ x: number; y: number }>,
  baselineY: number,
): string {
  if (points.length === 0) return '';
  const first = points[0];
  const last = points[points.length - 1];
  return `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

export function shouldShowXLabel(index: number, total: number): boolean {
  if (total <= 8) return true;
  if (index === 0 || index === total - 1) return true;
  if (total <= 14) return index % 2 === 0;
  return index % 3 === 0;
}
