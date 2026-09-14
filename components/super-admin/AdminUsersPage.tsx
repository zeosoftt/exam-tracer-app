'use client';

import {
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  MailCheck,
  MailX,
} from 'lucide-react';
import { useAdminUsers } from '@/components/super-admin/hooks/useSuperAdminPanel';
import { formatAdminDateTime } from '@/components/super-admin/formatAdminDateTime';
import { ROLE_LABELS } from '@/components/super-admin/domain/superAdminTypes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

function roleBadgeVariant(role: string | null | undefined) {
  if (role === 'ADMIN') return 'destructive' as const;
  if (role === 'INSTITUTION_ADMIN') return 'warning' as const;
  return 'secondary' as const;
}

export function AdminUsersPage() {
  const { users, page, setPage, pagination, isLoadingUsers, usersLoadError } = useAdminUsers();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Users className="h-6 w-6 text-primary" />
          Kullanıcılar
        </h2>
        <p className="text-sm text-muted-foreground">Kayıtlı kullanıcı listesi (sayfalı)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Liste</CardTitle>
          <CardDescription>
            {pagination.total > 0
              ? `Toplam ${pagination.total} kullanıcı`
              : 'Kullanıcı kayıtları'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {usersLoadError ? (
            <Alert variant="destructive" className="mx-6 mb-4">
              <AlertDescription>{usersLoadError}</AlertDescription>
            </Alert>
          ) : null}
          {isLoadingUsers ? (
            <div className="flex justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14 text-center" title="E-posta doğrulama">
                      <Mail className="mx-auto h-4 w-4 opacity-70" aria-hidden />
                      <span className="sr-only">E-posta doğrulama</span>
                    </TableHead>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead className="min-w-[120px]">Kaynak</TableHead>
                    <TableHead className="min-w-[140px]">Sınavlar</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Son Giriş</TableHead>
                    <TableHead>Kayıt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoadError ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                        Liste yüklenemedi.
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                        Kullanıcı bulunamadı.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="text-center">
                          {u.emailVerified ? (
                            <span
                              className="inline-flex rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                              title="E-posta doğrulandı"
                            >
                              <MailCheck className="h-4 w-4" aria-hidden />
                              <span className="sr-only">E-posta doğrulandı</span>
                            </span>
                          ) : (
                            <span
                              className="inline-flex rounded-full bg-amber-100 p-2 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              title="E-posta doğrulanmadı"
                            >
                              <MailX className="h-4 w-4" aria-hidden />
                              <span className="sr-only">E-posta doğrulanmadı</span>
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {u.firstName} {u.lastName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="max-w-[200px] text-sm text-muted-foreground">
                          <span className="line-clamp-2" title={u.hearAboutLabel}>
                            {u.hearAboutLabel ?? '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {u.exams?.length ? (
                            <div className="flex max-w-xs flex-wrap gap-1.5">
                              {u.exams.map((ex) => (
                                <Badge key={ex.id} variant="outline" title={ex.code}>
                                  {ex.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={roleBadgeVariant(u.role)}>
                            {ROLE_LABELS[u.role || ''] ?? u.role ?? '—'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.isActive ? (
                            <Badge variant="success">Aktif</Badge>
                          ) : (
                            <Badge variant="secondary">Pasif</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatAdminDateTime(u.lastLoginAt)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatAdminDateTime(u.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {pagination.totalPages > 1 ? (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Toplam {pagination.total} kullanıcı · Sayfa {page} / {pagination.totalPages}
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
    </div>
  );
}
