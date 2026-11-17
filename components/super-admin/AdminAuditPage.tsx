'use client';

import { AuditLogsSection } from '@/components/super-admin/AuditLogsSection';
import { AdminPageHeader } from '@/components/super-admin/layout/AdminPageHeader';
import { ADMIN_NAV_ITEMS } from '@/components/super-admin/layout/adminNav';

const nav = ADMIN_NAV_ITEMS.find((i) => i.href.endsWith('/audit'));

export function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title={nav?.title ?? 'Denetim Kayıtları'} description={nav?.description} />
      <AuditLogsSection />
    </div>
  );
}
