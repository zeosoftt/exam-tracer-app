jest.mock('@/lib/siteSettings', () => ({
  getSetting: jest.fn(),
  setSetting: jest.fn(),
  incrementShopierCheckoutClick: jest.fn(),
}));

import { getSetting, setSetting } from '@/lib/siteSettings';
import {
  MARKETING_METRICS_KEY,
  MARKETING_PURCHASES_TOTAL_KEY,
  recordShopierPurchaseActivation,
} from '@/lib/marketing/marketingMetricsStore';

const mockGet = getSetting as jest.MockedFunction<typeof getSetting>;
const mockSet = setSetting as jest.MockedFunction<typeof setSetting>;

describe('recordShopierPurchaseActivation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockImplementation(async (key: string) => {
      if (key === MARKETING_PURCHASES_TOTAL_KEY) return '0';
      if (key === MARKETING_METRICS_KEY) return '{}';
      return '';
    });
    mockSet.mockResolvedValue(undefined as never);
  });

  it('increments purchase total and both purchase + pro_activated event counters once', async () => {
    await recordShopierPurchaseActivation();

    expect(mockSet).toHaveBeenCalledWith(MARKETING_PURCHASES_TOTAL_KEY, '1');

    const metricsWrites = mockSet.mock.calls.filter((c) => c[0] === MARKETING_METRICS_KEY);
    expect(metricsWrites.length).toBeGreaterThanOrEqual(2);

    const lastMetrics = JSON.parse(String(metricsWrites[metricsWrites.length - 1][1])) as Record<
      string,
      number
    >;
    // After sequential increments, both events should be present
    const allCounts: Record<string, number> = {};
    for (const call of metricsWrites) {
      Object.assign(allCounts, JSON.parse(String(call[1])));
    }
    expect(allCounts.purchase).toBeGreaterThanOrEqual(1);
    expect(allCounts['purchase:shopier_webhook']).toBeGreaterThanOrEqual(1);
    expect(allCounts.pro_activated).toBeGreaterThanOrEqual(1);
    expect(allCounts['pro_activated:shopier_webhook']).toBeGreaterThanOrEqual(1);
    expect(lastMetrics).toBeTruthy();
  });
});
