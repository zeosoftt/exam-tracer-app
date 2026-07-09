'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2, ScrollText } from 'lucide-react';
import type { AdminAuditLog } from '@/components/super-admin/domain/superAdminTypes';
import { fetchSuperAdminAuditLogs } from '@/lib/client-api/superAdminClient';
import { formatAdminDateTime } from '@/components/super-admin/hooks/useSuperAdminPanel';

export function AuditLogsSection() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ limit: 15, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSuperAdminAuditLogs(pageNum, 15);
      if (result.ok) {
        setLogs(result.logs);
        setPagination(result.pagination);
      } else {
        setError(result.message);
        setLogs([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs(page);
  }, [page, loadLogs]);

  return (
    <section className="mt-10 space-y-4">
      <div className="flex items-center gap-2">
        <ScrollText className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden />
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Audit Log</h2>
      </div>
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Super-admin mutasyonları (site ayarları, sınav içeriği vb.) kayıt altına alınır.
      </p>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
        {error ? (
          <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-8 text-stone-500 dark:text-stone-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Yükleniyor...</span>
          </div>
        ) : logs.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-stone-500 dark:text-stone-400">
            Henüz kayıt yok veya tablo henüz oluşturulmadı.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-stone-50 text-xs font-semibold uppercase tracking-wider text-stone-600 dark:bg-stone-900/80 dark:text-stone-400">
                    <th className="px-5 py-3">Tarih</th>
                    <th className="px-5 py-3">İşlem</th>
                    <th className="px-5 py-3">Kaynak</th>
                    <th className="px-5 py-3">Kullanıcı</th>
                    <th className="px-5 py-3">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-t border-stone-100 dark:border-stone-800"
                    >
                      <td className="whitespace-nowrap px-5 py-3 text-stone-600 dark:text-stone-400">
                        {formatAdminDateTime(log.createdAt)}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-stone-800 dark:text-stone-200">
                        {log.action}
                      </td>
                      <td className="max-w-xs truncate px-5 py-3 text-stone-600 dark:text-stone-400" title={log.resource ?? undefined}>
                        {log.resource ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-stone-700 dark:text-stone-300">
                        {log.actor.email ?? log.actor.name ?? log.actor.id}
                      </td>
                      <td className="px-5 py-3 text-stone-500 dark:text-stone-400">{log.ipAddress ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 ? (
              <div className="flex items-center justify-between border-t border-stone-200 px-5 py-3 dark:border-stone-800">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Toplam {pagination.total} kayıt · Sayfa {page} / {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-stone-200 p-2 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page >= pagination.totalPages}
                    className="rounded-lg border border-stone-200 p-2 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
