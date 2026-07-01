import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LandingReveal } from '@/components/landing/LandingReveal';

type PublicPageCtaProps = {
  message?: string;
  secondaryLinks?: Array<{ href: string; label: string }>;
};

export function PublicPageCta({
  message = 'Dakikalar içinde ücretsiz hesap açın; kredi kartı gerekmez.',
  secondaryLinks = [
    { href: '/sss', label: 'Sıkça sorulan sorular' },
    { href: '/sinavlar', label: 'Tüm sınavlar' },
  ],
}: PublicPageCtaProps) {
  return (
    <LandingReveal className="mt-8 sm:mt-10">
      <div className="landing-glass-card landing-hover-lift relative overflow-hidden rounded-2xl p-5 text-center sm:p-8">
        <div className="landing-dot-grid absolute inset-0 opacity-10" aria-hidden />
        <div className="relative">
          <p className="mb-4 text-sm leading-relaxed text-stone-700 dark:text-stone-200 sm:text-base">{message}</p>
          <Link
            href="/onboarding"
            className="landing-vibe-cta group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-700 to-primary-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
          >
            Ücretsiz başla
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          {secondaryLinks.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-stone-600 dark:text-stone-400">
              {secondaryLinks.map(({ href, label }) => (
                <Link key={href} href={href} className="font-medium text-primary-700 hover:underline dark:text-primary-300">
                  {label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </LandingReveal>
  );
}
