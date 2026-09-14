'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ComponentType, type ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BookOpen,
  Settings,
  ScrollText,
  Shield,
  Menu,
  ArrowLeft,
  BarChart2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  match?: 'exact' | 'prefix';
};

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard/super-admin', label: 'Özet', icon: LayoutDashboard, match: 'exact' },
  { href: '/dashboard/super-admin/users', label: 'Kullanıcılar', icon: Users, match: 'prefix' },
  { href: '/dashboard/super-admin/marketing', label: 'Pazarlama', icon: BarChart2, match: 'prefix' },
  { href: '/dashboard/super-admin/plans', label: 'Planlar', icon: CreditCard, match: 'prefix' },
  { href: '/dashboard/super-admin/exam-content', label: 'Sınav içeriği', icon: BookOpen, match: 'prefix' },
  { href: '/dashboard/super-admin/settings', label: 'Ayarlar', icon: Settings, match: 'prefix' },
  { href: '/dashboard/super-admin/audit', label: 'Denetim', icon: ScrollText, match: 'prefix' },
];

const PAGE_TITLES: { prefix: string; title: string }[] = [
  { prefix: '/dashboard/super-admin/users', title: 'Kullanıcılar' },
  { prefix: '/dashboard/super-admin/marketing', title: 'Pazarlama' },
  { prefix: '/dashboard/super-admin/plans', title: 'Planlar & Abonelikler' },
  { prefix: '/dashboard/super-admin/exam-content', title: 'Sınav & İçerik' },
  { prefix: '/dashboard/super-admin/settings', title: 'Ayarlar' },
  { prefix: '/dashboard/super-admin/audit', title: 'Denetim' },
  { prefix: '/dashboard/super-admin', title: 'Super Admin' },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.match === 'exact') {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function pageTitle(pathname: string): string {
  for (const row of PAGE_TITLES) {
    if (pathname === row.prefix || pathname.startsWith(`${row.prefix}/`)) {
      return row.title;
    }
  }
  return 'Super Admin';
}

function NavLinks({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn('flex flex-col gap-1', className)}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const highlighted = isActive(pathname, item);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              highlighted
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = pageTitle(pathname);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold tracking-tight">Admin</span>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <NavLinks pathname={pathname} />
        </ScrollArea>
        <div className="border-t p-3">
          <Button variant="ghost" className="w-full justify-start gap-2" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Menü">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b px-4 py-3 text-left">
                <SheetTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Admin
                </SheetTitle>
              </SheetHeader>
              <div className="px-3 py-4">
                <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                <Separator className="my-4" />
                <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <ArrowLeft className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
          </div>
          <ThemeToggleCompact />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
