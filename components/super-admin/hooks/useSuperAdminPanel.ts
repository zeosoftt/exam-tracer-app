'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import type { AdminStats, AdminUser } from '../domain/superAdminTypes';
import type { AdminSiteSettings } from '@/lib/siteSettings';
import {
  fetchSuperAdminSiteSettings,
  fetchSuperAdminStats,
  fetchSuperAdminUsersPage,
  patchSuperAdminSiteSettings,
} from '@/lib/client-api/superAdminClient';

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsLoadError, setStatsLoadError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setStatsLoadError(null);
    setIsLoadingStats(true);
    try {
      const data = await fetchSuperAdminStats();
      if (data) {
        startTransition(() => setStats(data));
      } else {
        setStatsLoadError('İstatistikler yüklenemedi.');
      }
    } catch {
      setStatsLoadError('İstatistikler yüklenemedi.');
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return { stats, isLoadingStats, statsLoadError, reloadStats: loadStats };
}

export function useAdminUsers(pageSize = 10) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ limit: pageSize, total: 0, totalPages: 0 });
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersLoadError, setUsersLoadError] = useState<string | null>(null);

  const loadUsers = useCallback(
    async (pageNum: number) => {
      setIsLoadingUsers(true);
      setUsersLoadError(null);
      try {
        const result = await fetchSuperAdminUsersPage(pageNum, pageSize);
        if (result.ok) {
          startTransition(() => {
            setUsers(result.users);
            setPagination(result.pagination);
          });
          setUsersLoadError(null);
        } else {
          setUsers([]);
          setPagination({ limit: pageSize, total: 0, totalPages: 0 });
          setUsersLoadError(result.message);
        }
      } catch {
        setUsers([]);
        setPagination({ limit: pageSize, total: 0, totalPages: 0 });
        setUsersLoadError('Bağlantı hatası. Ağı kontrol edip yenileyin.');
      } finally {
        setIsLoadingUsers(false);
      }
    },
    [pageSize],
  );

  useEffect(() => {
    void loadUsers(page);
  }, [page, loadUsers]);

  return {
    users,
    page,
    setPage,
    pagination,
    isLoadingUsers,
    usersLoadError,
  };
}

export function useAdminSiteSettings() {
  const [siteSettings, setSiteSettings] = useState<AdminSiteSettings | null>(null);
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(true);
  const [siteSettingsPatching, setSiteSettingsPatching] = useState(false);
  const [siteSettingsLoadError, setSiteSettingsLoadError] = useState<string | null>(null);
  const [siteSettingsPatchError, setSiteSettingsPatchError] = useState<string | null>(null);

  const loadSiteSettings = useCallback(async () => {
    setSiteSettingsLoadError(null);
    setSiteSettingsLoading(true);
    try {
      const data = await fetchSuperAdminSiteSettings();
      if (data) {
        startTransition(() => setSiteSettings(data));
      } else {
        setSiteSettingsLoadError('Site ayarları yüklenemedi.');
      }
    } catch {
      setSiteSettingsLoadError('Site ayarları yüklenemedi.');
    } finally {
      setSiteSettingsLoading(false);
    }
  }, []);

  const patchSiteSettings = useCallback(async (patch: Partial<AdminSiteSettings>) => {
    setSiteSettingsPatching(true);
    setSiteSettingsPatchError(null);
    try {
      const data = await patchSuperAdminSiteSettings(patch);
      if (data) {
        startTransition(() => setSiteSettings(data));
      } else {
        setSiteSettingsPatchError('Ayar kaydedilemedi.');
      }
    } catch {
      setSiteSettingsPatchError('Ayar kaydedilemedi.');
    } finally {
      setSiteSettingsPatching(false);
    }
  }, []);

  useEffect(() => {
    void loadSiteSettings();
  }, [loadSiteSettings]);

  return {
    siteSettings,
    siteSettingsLoading,
    siteSettingsPatching,
    siteSettingsLoadError,
    siteSettingsPatchError,
    patchSiteSettings,
  };
}

/** @deprecated Prefer focused hooks: useAdminStats / useAdminUsers / useAdminSiteSettings */
export function useSuperAdminPanel() {
  const stats = useAdminStats();
  const users = useAdminUsers();
  const settings = useAdminSiteSettings();
  return { ...stats, ...users, ...settings };
}
