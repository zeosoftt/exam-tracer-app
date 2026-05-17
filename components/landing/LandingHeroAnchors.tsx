import { ArrowDown, BarChart3, HelpCircle, Layers } from 'lucide-react';

const ANCHORS = [
  { href: '#nasil', label: 'Nasıl çalışır', icon: Layers },
  { href: '#ozellikler', label: 'Özellikler', icon: BarChart3 },
  { href: '#paketler', label: 'Paketler', icon: Layers },
  { href: '/sss', label: 'SSS', icon: HelpCircle },
] as const;

/** Hero altı hızlı gezinme — scroll derinliği ve süre için. */
export function LandingHeroAnchors() {
  return (
    <nav
      className="landing-hero-in landing-hero-in-4 mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
      aria-label="Sayfa içi gezinme"
    >
      {ANCHORS.map(({ href, label, icon: Icon }) => (
        <a
          key={href}
          href={href}
          className="landing-hover-lift inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/90 px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-sm backdrop-blur-sm transition-colors hover:border-primary-300 hover:text-primary-800 dark:border-stone-600 dark:bg-stone-900/90 dark:text-stone-200 dark:hover:border-primary-600 dark:hover:text-primary-200 sm:text-sm"
        >
          <Icon className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" aria-hidden />
          {label}
          <ArrowDown className="h-3 w-3 opacity-50" aria-hidden />
        </a>
      ))}
    </nav>
  );
}
