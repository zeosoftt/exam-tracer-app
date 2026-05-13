import type { AdminStats, AdminUser, PlanStat } from '../domain/superAdminTypes';

export async function fetchSuperAdminStats(): Promise<AdminStats | null> {
  const res = await fetch('/api/super-admin/stats');
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: AdminStats };
  return json.data ?? null;
}

export type UsersPageResult =
  | {
      ok: true;
      users: AdminUser[];
      pagination: { limit: number; total: number; totalPages: number };
    }
  | { ok: false; message: string };

export async function fetchSuperAdminUsersPage(pageNum: number, limit = 10): Promise<UsersPageResult> {
  const res = await fetch(`/api/super-admin/users?page=${pageNum}&limit=${limit}`);
  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    data?: { users: AdminUser[]; pagination: { limit: number; total: number; totalPages: number } };
    error?: string | { message?: string };
  };
  if (res.ok && json.success && Array.isArray(json.data?.users)) {
    const p = json.data!.pagination;
    return {
      ok: true,
      users: json.data!.users,
      pagination: { limit: p.limit, total: p.total, totalPages: p.totalPages },
    };
  }
  const msg =
    typeof json.error === 'string'
      ? json.error
      : json.error?.message ?? `Liste yüklenemedi (HTTP ${res.status}).`;
  return { ok: false, message: msg };
}

export async function fetchSuperAdminSiteSettings(): Promise<Record<string, boolean> | null> {
  const res = await fetch('/api/super-admin/site-settings');
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: Record<string, boolean> };
  return json.data ?? null;
}

export async function patchSuperAdminSiteSettings(
  patch: { landing_show_partners?: boolean; deneme_show_advanced?: boolean },
): Promise<Record<string, boolean> | null> {
  const res = await fetch('/api/super-admin/site-settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: Record<string, boolean> };
  return json.data ?? null;
}

export async function fetchSuperAdminPlanStats(): Promise<{ ok: true; planStats: PlanStat[] } | { ok: false; message: string }> {
  const res = await fetch('/api/super-admin/stats');
  const json = (await res.json().catch(() => ({}))) as { data?: { planStats?: PlanStat[] }; error?: string };
  if (!res.ok) {
    return { ok: false, message: json.error || 'Yüklenemedi' };
  }
  return { ok: true, planStats: json.data?.planStats ?? [] };
}
