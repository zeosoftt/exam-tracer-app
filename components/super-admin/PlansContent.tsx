'use client';

import { CreditCard } from 'lucide-react';
import { usePlansContent } from '@/components/super-admin/hooks/usePlansContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminPageHeader } from '@/components/super-admin/layout/AdminPageHeader';
import { AdminErrorAlert } from '@/components/super-admin/layout/AdminErrorAlert';
import { AdminTableSkeleton } from '@/components/super-admin/layout/AdminLoading';
import { ADMIN_NAV_ITEMS } from '@/components/super-admin/layout/adminNav';

const nav = ADMIN_NAV_ITEMS.find((i) => i.href.endsWith('/plans'));
const numberFormat = new Intl.NumberFormat('tr-TR');

export function PlansContent() {
  const { planStats, loading, error, reload } = usePlansContent();

  const totalUsers = planStats.reduce((sum, p) => sum + p.userCount, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={nav?.title ?? 'Planlar & Abonelikler'}
        description={nav?.description}
      />

      {error ? (
        <AdminErrorAlert message={error} onRetry={() => void reload()} retrying={loading} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-primary" aria-hidden />
            Planlara göre kullanıcı sayısı
          </CardTitle>
          <CardDescription>
            {loading
              ? 'Yükleniyor…'
              : totalUsers > 0
                ? `Toplam ${numberFormat.format(totalUsers)} kullanıcı`
                : 'FREE / PRO / ENTERPRISE dağılımı'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <AdminTableSkeleton rows={3} columns={4} />
          ) : error ? null : planStats.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              Henüz plan verisi yok.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Plan</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead className="text-right">Kullanıcı</TableHead>
                  <TableHead className="w-[40%] min-w-[160px]">Pay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planStats.map((p) => {
                  const share = totalUsers > 0 ? (p.userCount / totalUsers) * 100 : 0;
                  return (
                    <TableRow key={p.planId ?? p.planCode}>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold">{p.planName}</span>
                          <span className="font-mono text-xs text-muted-foreground">{p.planCode}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{p.planType}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {numberFormat.format(p.userCount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                            <div
                              className="h-full rounded-full bg-primary/70"
                              style={{ width: `${Math.max(share > 0 ? 2 : 0, share)}%` }}
                            />
                          </div>
                          <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                            %{share.toFixed(share >= 10 ? 0 : 1)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
