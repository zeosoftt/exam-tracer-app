import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { LandingReveal } from '@/components/landing/LandingReveal';

const PAIRS = [
  {
    pain: 'Excel veya defterde dağınık deneme notları',
    fix: 'Tüm denemeler tek listede; net ve puan otomatik hesaplanır',
  },
  {
    pain: 'Hangi konuda geride kaldığınızı bilememek',
    fix: 'Konu bazlı ilerleme yüzdesi ve haftalık hedef çubukları',
  },
  {
    pain: 'Motivasyonu kaybetmek',
    fix: 'Tamamlanan konular ve trend grafikleriyle görünür ilerleme',
  },
] as const;

export function LandingPainPoints() {
  return (
    <section id="sorunlar" className="bg-stone-100/80 py-14 dark:bg-stone-900/50 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <LandingReveal className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl lg:text-4xl">
            Tanıdık geliyor mu?
          </h2>
          <p className="mt-3 text-base text-stone-600 dark:text-stone-300 sm:text-lg">
            Sınav hazırlığında en çok vakit kaybettiren üç durum — ve The Goal Lab ile nasıl çözüldüğü.
          </p>
        </LandingReveal>
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {PAIRS.map(({ pain, fix }, i) => (
            <LandingReveal key={pain} delay={i * 80} className="h-full">
              <article className="landing-hover-lift flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-900/90">
                <div className="mb-4 flex items-start gap-2 text-amber-800 dark:text-amber-300">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                  <p className="text-sm font-medium leading-snug text-stone-700 dark:text-stone-300">{pain}</p>
                </div>
                <div className="mt-auto flex items-start gap-2 border-t border-stone-100 pt-4 dark:border-stone-800">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" aria-hidden />
                  <p className="text-sm font-semibold leading-snug text-stone-900 dark:text-stone-100">{fix}</p>
                </div>
              </article>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
