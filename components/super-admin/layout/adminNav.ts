import type { ComponentType } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BookOpen,
  Settings,
  ScrollText,
  BarChart2,
} from 'lucide-react';

export type AdminNavGroup = 'overview' | 'growth' | 'content' | 'system';

export type AdminNavItem = {
  href: string;
  /** Kısa etiket (sidebar) */
  label: string;
  /** Sayfa başlığı (header + içerik) */
  title: string;
  /** Sayfa açıklaması (içerik başlığı altı) */
  description: string;
  icon: ComponentType<{ className?: string }>;
  group: AdminNavGroup;
  match: 'exact' | 'prefix';
};

export const ADMIN_ROOT = '/dashboard/super-admin';

export const ADMIN_NAV_GROUPS: { id: AdminNavGroup; label: string | null }[] = [
  { id: 'overview', label: null },
  { id: 'growth', label: 'Büyüme' },
  { id: 'content', label: 'İçerik' },
  { id: 'system', label: 'Sistem' },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: ADMIN_ROOT,
    label: 'Özet',
    title: 'Sistem Özeti',
    description: 'KPI’lar ve yönetim alanlarına hızlı erişim',
    icon: LayoutDashboard,
    group: 'overview',
    match: 'exact',
  },
  {
    href: `${ADMIN_ROOT}/users`,
    label: 'Kullanıcılar',
    title: 'Kullanıcılar',
    description: 'Kayıtlı kullanıcı listesi, rol ve doğrulama durumu',
    icon: Users,
    group: 'growth',
    match: 'prefix',
  },
  {
    href: `${ADMIN_ROOT}/marketing`,
    label: 'Pazarlama',
    title: 'Pazarlama',
    description: 'Satış hunisi, dönüşüm ve oturum etkileşim metrikleri',
    icon: BarChart2,
    group: 'growth',
    match: 'prefix',
  },
  {
    href: `${ADMIN_ROOT}/plans`,
    label: 'Planlar',
    title: 'Planlar & Abonelikler',
    description: 'Plan listesi ve FREE / PRO / ENTERPRISE kullanıcı dağılımı',
    icon: CreditCard,
    group: 'growth',
    match: 'prefix',
  },
  {
    href: `${ADMIN_ROOT}/exam-content`,
    label: 'Sınav içeriği',
    title: 'Sınav & İçerik',
    description: 'Sınav → Bölüm → Ders → Konu ağacını yönetin',
    icon: BookOpen,
    group: 'content',
    match: 'prefix',
  },
  {
    href: `${ADMIN_ROOT}/settings`,
    label: 'Ayarlar',
    title: 'Ayarlar',
    description: 'Ana sayfa bölümleri, deneme sayfası, Pro fiyatı ve izleme',
    icon: Settings,
    group: 'system',
    match: 'prefix',
  },
  {
    href: `${ADMIN_ROOT}/audit`,
    label: 'Denetim',
    title: 'Denetim Kayıtları',
    description: 'Super-admin mutasyonları (site ayarları, sınav içeriği vb.) kayıt altına alınır',
    icon: ScrollText,
    group: 'system',
    match: 'prefix',
  },
];

export function isAdminNavActive(pathname: string, item: AdminNavItem): boolean {
  if (item.match === 'exact') return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function findAdminNavItem(pathname: string): AdminNavItem | undefined {
  // Önce prefix eşleşen alt sayfalar, en sonda kök (exact).
  const nested = ADMIN_NAV_ITEMS.filter((i) => i.match === 'prefix').find((i) =>
    isAdminNavActive(pathname, i),
  );
  if (nested) return nested;
  return ADMIN_NAV_ITEMS.find((i) => i.match === 'exact' && isAdminNavActive(pathname, i));
}
