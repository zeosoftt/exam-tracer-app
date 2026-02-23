'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  BookOpen,
  Timer,
  ClipboardList,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface AdminStats {
  usersCount: number;
  activeUsersCount: number;
  examsCount: number;
  pomodoroSessionsCount: number;
  examAssignmentsCount: number;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  INSTITUTION_ADMIN: 'Kurum Admin',
  INDIVIDUAL: 'Bireysel',
  VIEWER: 'İzleyici',
};

export function SuperAdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ limit: 20, total: 0, totalPages: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/super-admin/stats');
      if (res.ok) {
        const json = await res.json();
        setStats(json.data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchUsers = async (pageNum: number) => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch(`/api/super-admin/users?page=${pageNum}&limit=20`);
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data.users);
        const p = json.data.pagination;
        setPagination({ limit: p.limit, total: p.total, totalPages: p.totalPages });
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-indigo-600">Super Admin Panel</span>
            </div>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Sistem Özeti</h1>

        {/* Stats */}
        {isLoadingStats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-indigo-100">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Toplam Kullanıcı</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.usersCount}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-100">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Aktif Kullanıcı</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsersCount}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-amber-100">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Sınav</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.examsCount}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Timer className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Pomodoro Oturum</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.pomodoroSessionsCount}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-100">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-600">Sınav Ataması</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.examAssignmentsCount}</p>
            </div>
          </div>
        ) : null}

        {/* Users table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Kullanıcılar</h2>
            <p className="text-sm text-gray-500 mt-0.5">Kayıtlı kullanıcı listesi (sayfalı)</p>
          </div>
          {isLoadingUsers ? (
            <div className="p-8 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-5 py-3">Ad Soyad</th>
                      <th className="px-5 py-3">E-posta</th>
                      <th className="px-5 py-3">Rol</th>
                      <th className="px-5 py-3">Durum</th>
                      <th className="px-5 py-3">Son Giriş</th>
                      <th className="px-5 py-3">Kayıt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                          Kullanıcı bulunamadı.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                          <td className="px-5 py-3 font-medium text-gray-900">
                            {u.firstName} {u.lastName}
                          </td>
                          <td className="px-5 py-3 text-gray-600">{u.email}</td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                u.role === 'ADMIN'
                                  ? 'bg-red-100 text-red-800'
                                  : u.role === 'INSTITUTION_ADMIN'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {ROLE_LABELS[u.role || ''] ?? u.role ?? '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            {u.isActive ? (
                              <span className="text-green-600 text-sm font-medium">Aktif</span>
                            ) : (
                              <span className="text-gray-400 text-sm">Pasif</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-500">{formatDate(u.lastLoginAt)}</td>
                          <td className="px-5 py-3 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {pagination.totalPages > 1 && (
                <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Toplam {pagination.total} kullanıcı · Sayfa {page} / {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={page >= pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
