import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader';

/** Admin panelden açılabilir; varsayılan kapalı. Gerçek ortaklık iddiası içermez. */
const AUDIENCE_AREAS = [
  { name: 'Kamu sınav adayları', initials: 'KPSS' },
  { name: 'Öğretmen adayları', initials: 'ÖABT' },
  { name: 'Lisansüstü adayları', initials: 'ALES' },
  { name: 'Üniversite adayları', initials: 'YKS' },
  { name: 'Özel dershaneler', initials: 'KURS' },
  { name: 'Kurumsal ekipler', initials: 'KURUM' },
] as const;

export function LandingPartners() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-32">
      <div className="landing-dot-grid absolute inset-0 opacity-15 dark:opacity-[0.06]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <LandingSectionHeader
          eyebrow="HEDEF KİTLE"
          title="Kimler için tasarlandı?"
          description="Bireysel adaydan kurumsal ekibe kadar farklı sınav hazırlığı senaryolarına uyum sağlar."
        />

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:gap-8">
          {AUDIENCE_AREAS.map(({ name, initials }, index) => (
            <LandingReveal key={initials} delay={index * 40}>
              <div className="landing-glass-card landing-hover-lift group rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 font-display text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-transform group-hover:scale-105 sm:mb-4 sm:h-16 sm:w-16 sm:text-lg">
                    {initials}
                  </div>
                  <p className="text-xs font-semibold text-stone-600 transition-colors group-hover:text-stone-900 dark:text-stone-300 dark:group-hover:text-stone-100 sm:text-sm">
                    {name}
                  </p>
                </div>
              </div>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
