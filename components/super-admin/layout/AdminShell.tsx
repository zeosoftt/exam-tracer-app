'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment, useState, type ReactNode } from 'react';
import { Shield, Menu, ArrowLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';
import {
  ADMIN_NAV_GROUPS,
  ADMIN_NAV_ITEMS,
  ADMIN_ROOT,
  findAdminNavItem,
  isAdminNavActive,
} from './adminNav';

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
    <nav className={cn('flex flex-col gap-5', className)} aria-label="Admin menüsü">
      {ADMIN_NAV_GROUPS.map((group) => {
        const items = ADMIN_NAV_ITEMS.filter((i) => i.group === group.id);
        if (items.length === 0) return null;

        return (
          <div key={group.id} className="flex flex-col gap-1">
            {group.label ? (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                {group.label}
              </p>
            ) : null}
            {items.map((item) => {
              const Icon = item.icon;
              const active = isAdminNavActive(pathname, item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-primary"
                    />
                  ) : null}
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

function BackToDashboard({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" asChild>
      <Link href="/dashboard" onClick={onNavigate}>
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Uygulamaya dön
      </Link>
    </Button>
  );
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const current = findAdminNavItem(pathname);
  const isRoot = !current || current.href === ADMIN_ROOT;

  return (
    <nav aria-label="Konum" className="flex min-w-0 items-center gap-1.5 text-sm">
      {isRoot ? (
        <span className="truncate font-semibold text-foreground">Super Admin</span>
      ) : (
        <Fragment>
          <Link
            href={ADMIN_ROOT}
            className="hidden shrink-0 text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Super Admin
          </Link>
          <ChevronRight
            className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground/60 sm:inline"
            aria-hidden
          />
          <span className="truncate font-semibold text-foreground" aria-current="page">
            {current.title}
          </span>
        </Fragment>
      )}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        İçeriğe geç
      </a>

      <aside className="hidden w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Shield className="h-4 w-4 text-primary" aria-hidden />
          </span>
          <span className="font-semibold tracking-tight">Super Admin</span>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <NavLinks pathname={pathname} />
        </ScrollArea>
        <div className="border-t p-3">
          <BackToDashboard />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6 lg:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Menüyü aç">
                <Menu className="h-4 w-4" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col p-0">
              <SheetHeader className="border-b px-4 py-3 text-left">
                <SheetTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4 text-primary" aria-hidden />
                  Super Admin
                </SheetTitle>
                <SheetDescription className="sr-only">Yönetim paneli menüsü</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-3 py-4">
                <NavLinks pathname={pathname} onNavigate={closeMobile} />
                <Separator className="my-4" />
                <BackToDashboard onNavigate={closeMobile} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <Breadcrumb pathname={pathname} />
          </div>
          <ThemeToggleCompact />
        </header>

        <main id="admin-main" tabIndex={-1} className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
