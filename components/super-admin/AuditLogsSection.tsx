'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AdminAuditLog } from '@/components/super-admin/domain/superAdminTypes';
import { fetchSuperAdminAuditLogs } from '@/lib/client-api/superAdminClient';
import { formatAdminDateTime } from '@/components/super-admin/formatAdminDateTime';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminErrorAlert } from '@/components/super-admin/layout/AdminErrorAlert';
import { AdminPagination } from '@/components/super-admin/layout/AdminPagination';
import { AdminTableSkeleton } from '@/components/super-admin/layout/AdminLoading';

const PAGE_SIZE = 15;

export function AuditLogsSection() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ limit: PAGE_SIZE, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSuperAdminAuditLogs(pageNum, PAGE_SIZE);
      if (result.ok) {
        setLogs(result.logs);
        setPagination(result.pagination);
      } else {
        setError(result.message);
        setLogs([]);
      }
    } catch {
      setError('Kayıtlar yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs(page);
  }, [page, loadLogs]);

  return (
    <div className="space-y-4">
      {error ? (
        <AdminErrorAlert message={error} onRetry={() => void loadLogs(page)} retrying={loading} />
      ) : null}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <AdminTableSkeleton rows={8} columns={5} />
          ) : error ? null : logs.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              Henüz kayıt yok veya tablo henüz oluşturulmadı.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="whitespace-nowrap">Tarih</TableHead>
                    <TableHead>İşlem</TableHead>
                    <TableHead>Kaynak</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                        {formatAdminDateTime(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                          {log.action}
                        </code>
                      </TableCell>
                      <TableCell
                        className="max-w-xs truncate text-muted-foreground"
                        title={log.resource ?? undefined}
                      >
                        {log.resource ?? '—'}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate" title={log.actor.email ?? undefined}>
                        {log.actor.email ?? log.actor.name ?? log.actor.id}
                      </TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                        {log.ipAddress ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <AdminPagination
                page={page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                noun="kayıt"
                onPageChange={setPage}
                disabled={loading}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
