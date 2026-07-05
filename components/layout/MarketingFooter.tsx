import Link from 'next/link';
import { ArrowRight, BookOpen, Instagram } from 'lucide-react';
import { AppVersionLabel } from '@/components/layout/AppVersionLabel';
import { getOrganizationSameAs } from '@/lib/seo/siteSeo';

const FOOTER_SECTIONS = [
  {
    title: 'Keşfet',
    links: [
      { label: 'Nasıl çalışır', href: '/#nasil' },
      { label: 'Özellikler', href: '/ozellikler' },
      { label: 'Sınavlar', href: '/sinavlar' },
      { label: 'Rehber', href: '/rehber' },
      { label: 'Paketler', href: '/#paketler' },
    ],
  },
  {
    title: 'Yardım',
    links: [
      { label: 'SSS', href: '/sss' },
      { label: 'Destek', href: '/destek' },
    ],
  },
  {
    title: 'Hesap',
    links: [
      { label: 'Giriş yap', href: '/auth/login' },
      { label: 'Ücretsiz başla', href: '/onboarding' },
    ],
  },
] as const;

const linkClass =
  'text-sm text-stone-600 transition-colors hover:text-primary-700 dark:text-stone-300 dark:hover:text-primary-300';

function buildSocialLinks() {
  return getOrganizationSameAs().map((href) => {
    const host = href.toLowerCase();
    if (host.includes('instagram')) {
      return { href, label: 'Instagram', icon: Instagram };
    }
    return null;
  }).filter((item): item is { href: string; label: string; icon: typeof Instagram } => item !== null);
}

export function MarketingFooter() {
  const socialLinks = buildSocialLinks();

  return (
    <footer className="relative border-t border-stone-200/80 bg-white/85 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-950/85">
      <div className="landing-dot-grid absolute inset-0 opacity-[0.12] dark:opacity-[0.05]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/20 transition-shadow group-hover:shadow-primary-600/35">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                The Goal Lab
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              KPSS, ALES, ÖABT ve YKS için konu takibi, deneme analizi ve hedef puan yönetimi — tek panelde.
            </p>
            <Link
              href="/onboarding"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-600/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Ücretsiz başla
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {FOOTER_SECTIONS.map(({ title, links }) => (
            <nav key={title} aria-label={title}>
              <p className="landing-section-eyebrow mb-3 text-[11px] font-bold tracking-[0.14em] text-primary-700 dark:text-primary-300">
                {title}
              </p>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    {href.startsWith('/#') ? (
                      <a href={href} className={linkClass}>
                        {label}
                      </a>
                    ) : (
                      <Link href={href} className={linkClass}>
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-stone-200/80 pt-6 dark:border-stone-800/80 sm:flex-row sm:justify-between">
          <p className="text-center text-xs text-stone-500 dark:text-stone-400 sm:text-left sm:text-sm">
            © {new Date().getFullYear()} The Goal Lab. Tüm hakları saklıdır.
            <span className="mx-1.5 text-stone-300 dark:text-stone-600" aria-hidden>
              ·
            </span>
            <AppVersionLabel className="inline text-stone-400 dark:text-stone-500" />
          </p>

          {socialLinks.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200/80 bg-stone-50/80 text-stone-600 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 dark:border-stone-700/80 dark:bg-stone-900/80 dark:text-stone-300 dark:hover:border-primary-800 dark:hover:bg-primary-950/50 dark:hover:text-primary-300"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
