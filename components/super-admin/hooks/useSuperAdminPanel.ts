'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import type { AdminStats, AdminUser } from '../domain/superAdminTypes';
import {
  fetchSuperAdminSiteSettings,
  fetchSuperAdminStats,
  fetchSuperAdminUsersPage,
  patchSuperAdminSiteSettings,
} from '@/lib/client-api/superAdminClient';
import { scheduleIdleTask } from '@/lib/runtime/scheduleIdleTask';

export function formatAdminDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function useSuperAdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ limit: 10, total: 0, totalPages: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersLoadError, setUsersLoadError] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] = useState<Record<string, boolean> | null>(null);
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(true);
  const [siteSettingsPatching, setSiteSettingsPatching] = useState(false);

  const loadSiteSettings = useCallback(async () => {
    try {
      const data = await fetchSuperAdminSiteSettings();
      startTransition(() => setSiteSettings(data));
    } catch {
      // ignore
    } finally {
      setSiteSettingsLoading(false);
    }
  }, []);

  const patchSiteSettings = useCallback(async (patch: {
    landing_show_partners?: boolean;
    deneme_show_advanced?: boolean;
  }) => {
    setSiteSettingsPatching(true);
    try {
      const data = await patchSuperAdminSiteSettings(patch);
      if (data) startTransition(() => setSiteSettings(data));
    } finally {
      setSiteSettingsPatching(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchSuperAdminStats();
      if (data) startTransition(() => setStats(data));
    } catch {
      // ignore
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const loadUsers = useCallback(async (pageNum: number) => {
    setIsLoadingUsers(true);
    setUsersLoadError(null);
    try {
      const result = await fetchSuperAdminUsersPage(pageNum, 10);
      if (result.ok) {
        startTransition(() => {
          setUsers(result.users);
          setPagination(result.pagination);
        });
        setUsersLoadError(null);
      } else {
        setUsers([]);
        setPagination({ limit: 10, total: 0, totalPages: 0 });
        setUsersLoadError(result.message);
      }
    } catch {
      setUsers([]);
      setPagination({ limit: 10, total: 0, totalPages: 0 });
      setUsersLoadError('Bağlantı hatası. Ağı kontrol edip yenileyin.');
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
    scheduleIdleTask(
      () => {
        void loadSiteSettings();
      },
      { timeout: 1200 },
    );
  }, [loadStats, loadSiteSettings]);

  useEffect(() => {
    void loadUsers(page);
  }, [page, loadUsers]);

  return {
    stats,
    users,
    page,
    setPage,
    pagination,
    isLoadingStats,
    isLoadingUsers,
    usersLoadError,
    siteSettings,
    siteSettingsLoading,
    siteSettingsPatching,
    patchSiteSettings,
    formatAdminDateTime,
  };
}
