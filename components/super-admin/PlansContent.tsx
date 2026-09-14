'use client';

import { Loader2, CreditCard } from 'lucide-react';
import { usePlansContent } from '@/components/super-admin/hooks/usePlansContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function PlansContent() {
  const { planStats, loading, error } = usePlansContent();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Plan listesi ve FREE / PRO / ENTERPRISE kullanıcı dağılımı.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-5 w-5 text-primary" />
            Planlara göre kullanıcı sayısı
          </CardTitle>
          <CardDescription>FREE / PRO / ENTERPRISE dağılımı</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="m-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : planStats.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              Henüz plan verisi yok.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Kullanıcı</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planStats.map((p) => (
                  <TableRow key={p.planId ?? p.planCode}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold">{p.planName}</span>
                        <span className="text-xs text-muted-foreground">{p.planCode}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.planType}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">{p.userCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
