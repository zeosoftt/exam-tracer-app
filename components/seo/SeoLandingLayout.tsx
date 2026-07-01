import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { PublicBackLink } from '@/components/layout/PublicBackLink';
import { PublicPageCta } from '@/components/layout/PublicPageCta';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { LandingReveal } from '@/components/landing/LandingReveal';

type SeoLandingLayoutProps = {
  backHref: string;
  backLabel: string;
  badge?: string;
  title: string;
  intro: string;
  highlights: readonly string[];
  relatedLinks?: Array<{ href: string; label: string }>;
  ctaMessage?: string;
  ctaSecondaryLinks?: Array<{ href: string; label: string }>;
};

export function SeoLandingLayout({
  backHref,
  backLabel,
  badge,
  title,
  intro,
  highlights,
  relatedLinks,
  ctaMessage,
  ctaSecondaryLinks,
}: SeoLandingLayoutProps) {
  return (
    <PublicPageShell>
      <PublicBackLink href={backHref} label={backLabel} />

      <LandingReveal>
        <header className="mb-8 sm:mb-10">
          {badge ? (
            <p className="landing-section-eyebrow mb-3 text-xs font-bold tracking-[0.14em] text-primary-700 dark:text-primary-300">
              {badge}
            </p>
          ) : null}
          <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl">
            <span className="landing-gradient-text">{title}</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-stone-600 dark:text-stone-300 sm:text-lg">{intro}</p>
        </header>
      </LandingReveal>

      <LandingReveal delay={80}>
        <section className="landing-glass-card landing-hover-lift rounded-2xl p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">Neler yapabilirsiniz?</h2>
          <ul className="mt-4 space-y-3">
            {highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-stone-600 dark:text-stone-300 sm:text-base"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </LandingReveal>

      {relatedLinks && relatedLinks.length > 0 ? (
        <LandingReveal delay={120}>
          <nav className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="İlgili sayfalar">
            {relatedLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-full border border-stone-200/80 bg-white/50 px-3 py-1 font-medium text-primary-700 backdrop-blur-sm transition-colors hover:border-primary-200 hover:bg-primary-50/50 dark:border-stone-700/80 dark:bg-stone-900/50 dark:text-primary-300 dark:hover:border-primary-800"
              >
                {label}
              </Link>
            ))}
          </nav>
        </LandingReveal>
      ) : null}

      <PublicPageCta message={ctaMessage} secondaryLinks={ctaSecondaryLinks} />
    </PublicPageShell>
  );
}
