import {
  buildSmoothLinePath,
  computeChartBounds,
  netToPlotY,
  shouldShowXLabel,
} from '@/lib/deneme/netLineChartLayout';

describe('computeChartBounds', () => {
  it('adds padding so small net swings stay visible', () => {
    const { chartMin, chartRange } = computeChartBounds([16, 17.25, 16.5]);
    expect(chartMin).toBeLessThan(16);
    expect(chartMin + chartRange).toBeGreaterThan(17.25);
  });
});

describe('netToPlotY', () => {
  it('maps higher nets to smaller y values', () => {
    const low = netToPlotY(10, 8, 4, 10, 100);
    const high = netToPlotY(12, 8, 4, 10, 100);
    expect(high).toBeLessThan(low);
  });
});

describe('buildSmoothLinePath', () => {
  it('returns a path for multiple points', () => {
    const path = buildSmoothLinePath([
      { x: 0, y: 10 },
      { x: 50, y: 20 },
      { x: 100, y: 15 },
    ]);
    expect(path).toMatch(/^M 0 10/);
    expect(path).toContain('C');
  });
});

describe('shouldShowXLabel', () => {
  it('shows all labels for short series', () => {
    expect(shouldShowXLabel(1, 6)).toBe(true);
  });

  it('thins labels for long series', () => {
    expect(shouldShowXLabel(5, 20)).toBe(false);
    expect(shouldShowXLabel(0, 20)).toBe(true);
    expect(shouldShowXLabel(19, 20)).toBe(true);
  });
});
