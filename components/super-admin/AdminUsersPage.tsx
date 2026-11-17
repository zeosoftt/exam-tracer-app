'use client';

import { Mail, MailCheck, MailX } from 'lucide-react';
import { useAdminUsers } from '@/components/super-admin/hooks/useSuperAdminPanel';
import { formatAdminDateTime } from '@/components/super-admin/formatAdminDateTime';
import { ROLE_LABELS } from '@/components/super-admin/domain/superAdminTypes';
import { Card, CardContent } from '@/components/ui/card';
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
import { AdminPagination } from '@/components/super-admin/layout/AdminPagination';
import { AdminTableSkeleton } from '@/components/super-admin/layout/AdminLoading';
import { ADMIN_NAV_ITEMS } from '@/components/super-admin/layout/adminNav';

const nav = ADMIN_NAV_ITEMS.find((i) => i.href.endsWith('/users'));

function roleBadgeVariant(role: string | null | undefined) {
  if (role === 'ADMIN') return 'destructive' as const;
  if (role === 'INSTITUTION_ADMIN') return 'warning' as const;
  return 'secondary' as const;
}

export function AdminUsersPage() {
  const { users, page, setPage, pagination, isLoadingUsers, usersLoadError, reloadUsers } =
    useAdminUsers();

  return (
    <div className="space-y-6">
      <AdminPageHeader title={nav?.title ?? 'Kullanıcılar'} description={nav?.description} />

      {usersLoadError ? (
        <AdminErrorAlert
          message={usersLoadError}
          onRetry={() => void reloadUsers()}
          retrying={isLoadingUsers}
        />
      ) : null}

      <Card>
        <CardContent className="p-0">
          {isLoadingUsers ? (
            <AdminTableSkeleton rows={8} columns={7} />
          ) : usersLoadError ? null : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-14 text-center">
                      <Mail className="mx-auto h-4 w-4 opacity-70" aria-hidden />
                      <span className="sr-only">E-posta doğrulama</span>
                    </TableHead>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead className="min-w-[120px]">Kaynak</TableHead>
                    <TableHead className="min-w-[140px]">Sınavlar</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="whitespace-nowrap">Son giriş</TableHead>
                    <TableHead className="whitespace-nowrap">Kayıt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                        Kullanıcı bulunamadı.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="text-center">
                          {u.emailVerified ? (
                            <span
                              className="inline-flex rounded-full bg-emerald-100 p-1.5 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                              title="E-posta doğrulandı"
                            >
                              <MailCheck className="h-4 w-4" aria-hidden />
                              <span className="sr-only">E-posta doğrulandı</span>
                            </span>
                          ) : (
                            <span
                              className="inline-flex rounded-full bg-amber-100 p-1.5 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              title="E-posta doğrulanmadı"
                            >
                              <MailX className="h-4 w-4" aria-hidden />
                              <span className="sr-only">E-posta doğrulanmadı</span>
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium">
                          {u.firstName} {u.lastName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="max-w-[200px] text-muted-foreground">
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
                            <span className="text-muted-foreground">—</span>
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
                        <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                          {formatAdminDateTime(u.lastLoginAt)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                          {formatAdminDateTime(u.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <AdminPagination
                page={page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                noun="kullanıcı"
                onPageChange={setPage}
                disabled={isLoadingUsers}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
