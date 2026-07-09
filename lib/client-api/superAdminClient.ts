import type { AdminStats, AdminUser, PlanStat, AdminAuditLog } from '@/components/super-admin/domain/superAdminTypes';
import type { AdminSiteSettings } from '@/lib/siteSettings';
import { fetchApiData, fetchJson, getApiErrorMessage, mutateApi } from '@/lib/client-api/http';

export async function fetchSuperAdminStats(): Promise<AdminStats | null> {
  const result = await fetchApiData<AdminStats>('/api/super-admin/stats');
  return result.ok ? result.data : null;
}

export type UsersPageResult =
  | {
      ok: true;
      users: AdminUser[];
      pagination: { limit: number; total: number; totalPages: number };
    }
  | { ok: false; message: string };

export async function fetchSuperAdminUsersPage(pageNum: number, limit = 10): Promise<UsersPageResult> {
  const { ok, body, status } = await fetchJson<{
    success?: boolean;
    data?: { users: AdminUser[]; pagination: { limit: number; total: number; totalPages: number } };
    error?: string | { message?: string };
  }>(`/api/super-admin/users?page=${pageNum}&limit=${limit}`);

  if (ok && body.success && Array.isArray(body.data?.users)) {
    const p = body.data!.pagination;
    return {
      ok: true,
      users: body.data!.users,
      pagination: { limit: p.limit, total: p.total, totalPages: p.totalPages },
    };
  }
  return {
    ok: false,
    message: getApiErrorMessage(body, `Liste yüklenemedi (HTTP ${status}).`),
  };
}

export async function fetchSuperAdminSiteSettings(): Promise<AdminSiteSettings | null> {
  const result = await fetchApiData<AdminSiteSettings>('/api/super-admin/site-settings');
  return result.ok ? result.data : null;
}

export async function patchSuperAdminSiteSettings(
  patch: Partial<AdminSiteSettings>,
): Promise<AdminSiteSettings | null> {
  const { ok, data } = await mutateApi<Partial<AdminSiteSettings>, AdminSiteSettings>(
    '/api/super-admin/site-settings',
    'PATCH',
    patch,
  );
  return ok ? (data ?? null) : null;
}

export async function fetchSuperAdminPlanStats(): Promise<
  { ok: true; planStats: PlanStat[] } | { ok: false; message: string }
> {
  const { ok, body } = await fetchJson<{ data?: { planStats?: PlanStat[] }; error?: string }>(
    '/api/super-admin/stats',
  );
  if (!ok) {
    return { ok: false, message: body.error || 'Yüklenemedi' };
  }
  return { ok: true, planStats: body.data?.planStats ?? [] };
}

export type AuditLogsPageResult =
  | {
      ok: true;
      logs: AdminAuditLog[];
      pagination: { limit: number; total: number; totalPages: number };
    }
  | { ok: false; message: string };

export async function fetchSuperAdminAuditLogs(pageNum: number, limit = 15): Promise<AuditLogsPageResult> {
  const { ok, body, status } = await fetchJson<{
    success?: boolean;
    data?: {
      logs: AdminAuditLog[];
      pagination: { limit: number; total: number; totalPages: number };
    };
    error?: string | { message?: string };
  }>(`/api/super-admin/audit-logs?page=${pageNum}&limit=${limit}`);

  if (ok && body.success && Array.isArray(body.data?.logs)) {
    const p = body.data!.pagination;
    return {
      ok: true,
      logs: body.data!.logs,
      pagination: { limit: p.limit, total: p.total, totalPages: p.totalPages },
    };
  }
  return {
    ok: false,
    message: getApiErrorMessage(body, `Audit log yüklenemedi (HTTP ${status}).`),
  };
}
