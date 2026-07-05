import Link from 'next/link';
import { Award, ArrowRight } from 'lucide-react';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader';

const EXAMS = ['KPSS', 'ÖABT', 'ALES', 'YKS', 'TYT', 'AYT', 'DGS', 'YDS', 'YÖKDİL', 'TUS', 'DUS', 'Diğer'] as const;

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
              {[...EXAMS, ...EXAMS].map((exam, i) => (
                <span
                  key={`${exam}-${i}`}
                  className="landing-exam-pill inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-stone-200/80 bg-white/60 px-4 py-2 text-sm font-semibold text-stone-700 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-200"
                >
                  <Award className="h-4 w-4 text-primary-600" />
                  {exam}
                </span>
              ))}
            </div>
          </div>
        </LandingReveal>

        <LandingReveal delay={120} className="mt-8 text-center">
          <Link
            href="/sinavlar"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 transition-colors hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
          >
            Tüm sınavlar için detaylı açıklama
            <ArrowRight className="h-4 w-4" />
          </Link>
        </LandingReveal>
      </div>
    </section>
  );
}
