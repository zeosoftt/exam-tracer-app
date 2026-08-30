import Link from 'next/link';
import { Award, ArrowRight, BookOpen } from 'lucide-react';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader';

/** Sınav adı → SEO slug; slug yoksa /sinavlar'a yönlendir */
const EXAM_ITEMS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'KPSS', href: '/sinavlar/kpss' },
  { label: 'ÖABT', href: '/sinavlar/oabt' },
  { label: 'ALES', href: '/sinavlar/ales' },
  { label: 'YKS', href: '/sinavlar/yks' },
  { label: 'TYT', href: '/sinavlar/yks' },
  { label: 'AYT', href: '/sinavlar/yks' },
  { label: 'DGS', href: '/sinavlar/dgs' },
  { label: 'YDS', href: '/sinavlar/yds' },
  { label: 'YÖKDİL', href: '/sinavlar' },
  { label: 'TUS', href: '/sinavlar' },
  { label: 'DUS', href: '/sinavlar' },
  { label: 'Diğer', href: '/sinavlar' },
];

export function LandingExamsStrip() {
  return (
    <section id="sinavlar" className="relative overflow-hidden border-y border-stone-100 py-12 dark:border-stone-800 sm:py-16">
      <div className="landing-dot-grid absolute inset-0 opacity-25 dark:opacity-10" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <LandingReveal>
          <LandingSectionHeader
            eyebrow="DESTEKLENEN SINAVLAR"
            title="Desteklenen sınavlar"
            description="KPSS konu takibi, ALES deneme analizi, ÖABT ve YKS (TYT/AYT) hazırlığı, DGS ve YDS — hepsinde ders/konu yapısını siz kurarsınız."
          />
        </LandingReveal>

        <LandingReveal delay={60}>
          <div className="landing-marquee-mask mt-2">
            <div className="landing-marquee-track flex w-max gap-3">
              {[...EXAM_ITEMS, ...EXAM_ITEMS].map(({ label, href }, i) => (
                <Link
                  key={`${label}-${i}`}
                  href={href}
                  className="landing-exam-pill landing-hover-lift inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-stone-200/80 bg-white/60 px-4 py-2 text-sm font-semibold text-stone-700 backdrop-blur-sm transition-colors hover:border-primary-300 hover:text-primary-800 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-200 dark:hover:border-primary-600 dark:hover:text-primary-200"
                >
                  <Award className="h-4 w-4 text-primary-600" aria-hidden />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </LandingReveal>

        <LandingReveal delay={120} className="mt-8 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
          <Link
            href="/sinavlar"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
          >
            Tüm sınavlar için detaylı açıklama
            <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="hidden text-stone-300 dark:text-stone-600 sm:inline" aria-hidden>
            |
          </span>
          <Link
            href="/rehber"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Hazırlık rehberleri
            <ArrowRight className="h-4 w-4" />
          </Link>
        </LandingReveal>
      </div>
    </section>
  );
}
