import { requireAdminPageSession } from '@/lib/auth/pageSession';
import { AdminShell } from '@/components/super-admin/layout/AdminShell';

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPageSession();

  return <AdminShell>{children}</AdminShell>;
}
