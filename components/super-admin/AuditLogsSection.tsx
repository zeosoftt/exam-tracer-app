'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2, ScrollText } from 'lucide-react';
import type { AdminAuditLog } from '@/components/super-admin/domain/superAdminTypes';
import { fetchSuperAdminAuditLogs } from '@/lib/client-api/superAdminClient';
import { formatAdminDateTime } from '@/components/super-admin/formatAdminDateTime';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <ScrollText className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-xl font-bold tracking-tight">Audit Log</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Super-admin mutasyonları (site ayarları, sınav içeriği vb.) kayıt altına alınır.
      </p>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kayıtlar</CardTitle>
          <CardDescription>Son işlemler</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <Alert variant="destructive" className="mx-6 mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Yükleniyor...</span>
            </div>
          ) : logs.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              Henüz kayıt yok veya tablo henüz oluşturulmadı.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>İşlem</TableHead>
                    <TableHead>Kaynak</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatAdminDateTime(log.createdAt)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.action}</TableCell>
                      <TableCell
                        className="max-w-xs truncate text-muted-foreground"
                        title={log.resource ?? undefined}
                      >
                        {log.resource ?? '—'}
                      </TableCell>
                      <TableCell>
                        {log.actor.email ?? log.actor.name ?? log.actor.id}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.ipAddress ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Toplam {pagination.total} kayıt · Sayfa {page} / {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={page >= pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
