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
      className="landing-hero-in landing-hero-in-4 mt-6 grid w-full min-w-0 grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:mt-8 lg:flex lg:flex-wrap lg:justify-start lg:gap-2"
      aria-label="Sayfa içi gezinme"
    >
      {ANCHORS.map(({ href, label, icon: Icon }) => (
        <a
          key={href}
          href={href}
          className="landing-hover-lift inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white/90 px-3 py-2 text-[11px] font-semibold text-stone-700 shadow-sm backdrop-blur-sm transition-colors hover:border-primary-300 hover:text-primary-800 dark:border-stone-600 dark:bg-stone-900/90 dark:text-stone-200 dark:hover:border-primary-600 dark:hover:text-primary-200 sm:px-3.5 sm:text-xs lg:justify-start lg:text-sm"
        >
          <Icon className="h-3.5 w-3.5 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
          <span className="truncate">{label}</span>
          <ArrowDown className="hidden h-3 w-3 shrink-0 opacity-50 sm:block" aria-hidden />
        </a>
      ))}
    </nav>
  );
}
