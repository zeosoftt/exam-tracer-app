'use client';

import { useMemo, useId } from 'react';
import {
  buildAreaPath,
  buildSmoothLinePath,
  buildYTicks,
  indexToPlotX,
  netToPlotY,
  shouldShowXLabel,
  type NetChartPoint,
} from '@/lib/deneme/netLineChartLayout';

const VIEW_W = 640;
const VIEW_H = 220;
const PAD = { left: 44, right: 16, top: 18, bottom: 36 };
const PLOT_W = VIEW_W - PAD.left - PAD.right;
const PLOT_H = VIEW_H - PAD.top - PAD.bottom;
const BASELINE_Y = PAD.top + PLOT_H;

type DenemeNetLineChartProps = {
  data: NetChartPoint[];
  chartMin: number;
  chartRange: number;
  avg: number;
};

export function DenemeNetLineChart({ data, chartMin, chartRange, avg }: DenemeNetLineChartProps) {
  const gradientId = useId().replace(/:/g, '');

  const layout = useMemo(() => {
    const points = data.map((d, i) => ({
      ...d,
      x: indexToPlotX(i, data.length, PAD.left, PLOT_W),
      y: netToPlotY(d.netScore, chartMin, chartRange, PAD.top, PLOT_H),
    }));

    const linePath = buildSmoothLinePath(points);
    const areaPath = buildAreaPath(linePath, points, BASELINE_Y);
    const yTicks = buildYTicks(chartMin, chartRange, 4);
    const avgY = netToPlotY(avg, chartMin, chartRange, PAD.top, PLOT_H);

    return { points, linePath, areaPath, yTicks, avgY };
  }, [data, chartMin, chartRange, avg]);

  if (data.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-[220px] w-full min-w-[280px] text-stone-500 dark:text-stone-400"
        role="img"
        aria-label="Deneme net çizgi grafiği"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {layout.yTicks.map((tick) => {
          const y = netToPlotY(tick, chartMin, chartRange, PAD.top, PLOT_H);
          return (
            <g key={tick}>
              <line
                x1={PAD.left}
                y1={y}
                x2={VIEW_W - PAD.right}
                y2={y}
                className="stroke-stone-200 dark:stroke-stone-700"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={PAD.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-stone-400 text-[10px] tabular-nums dark:fill-stone-500"
              >
                {tick.toFixed(tick % 1 === 0 ? 0 : 1)}
              </text>
            </g>
          );
        })}

        <line
          x1={PAD.left}
          y1={layout.avgY}
          x2={VIEW_W - PAD.right}
          y2={layout.avgY}
          className="stroke-amber-500/70 dark:stroke-amber-400/60"
          strokeWidth="1.5"
          strokeDasharray="6 5"
        />
        <text
          x={VIEW_W - PAD.right}
          y={layout.avgY - 6}
          textAnchor="end"
          className="fill-amber-600 text-[9px] font-medium dark:fill-amber-400"
        >
          Ort. {avg.toFixed(1)}
        </text>

        {layout.areaPath ? (
          <path d={layout.areaPath} fill={`url(#${gradientId})`} className="dark:opacity-90" />
        ) : null}

        <path
          d={layout.linePath}
          fill="none"
          className="stroke-primary-600 dark:stroke-primary-400"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {layout.points.map((point, i) => {
          const isLast = i === layout.points.length - 1;
          const dateLabel = new Date(point.attemptedAt).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
          });
          const tooltip = `${dateLabel} · ${point.examName}: ${point.netScore.toFixed(2)} net`;

          return (
            <g key={`${point.attemptedAt}-${i}`}>
              {isLast ? (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="8"
                  className="fill-primary-500/15 stroke-primary-500/30 dark:fill-primary-400/10 dark:stroke-primary-400/25"
                  strokeWidth="1"
                />
              ) : null}
              <circle
                cx={point.x}
                cy={point.y}
                r={isLast ? 5 : 4}
                className={
                  isLast
                    ? 'fill-primary-600 stroke-white dark:fill-primary-400 dark:stroke-stone-900'
                    : 'fill-white stroke-primary-500 dark:fill-stone-900 dark:stroke-primary-400'
                }
                strokeWidth="2"
              >
                <title>{tooltip}</title>
              </circle>
              {shouldShowXLabel(i, data.length) ? (
                <text
                  x={point.x}
                  y={VIEW_H - 10}
                  textAnchor="middle"
                  className="fill-stone-500 text-[10px] dark:fill-stone-400"
                >
                  {dateLabel}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
