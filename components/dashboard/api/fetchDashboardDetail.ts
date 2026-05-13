import type { DetailData } from '../detail/dashboardDetailTypes';

export type FetchDetailOptions = { force?: boolean };

export async function fetchDashboardDetailData(options?: FetchDetailOptions): Promise<DetailData | null> {
  const url = options?.force ? '/api/dashboard/detail?fresh=1' : '/api/dashboard/detail';
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = (await response.json()) as { data?: DetailData };
  return data.data ?? null;
}
