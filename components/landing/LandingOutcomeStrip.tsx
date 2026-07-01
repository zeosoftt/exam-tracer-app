import { BarChart3, BookOpen, Target } from 'lucide-react';
import { LandingReveal } from '@/components/landing/LandingReveal';

const OUTCOMES = [
  {
    icon: Target,
    label: 'Net hedef',
    desc: 'Haftalık çalışma günü ve konu tamamlama hedefi',
  },
  {
    icon: BookOpen,
    label: 'Tek kaynak',
    desc: 'Sınav, ders, konu ve deneme aynı panelde',
  },
  {
    icon: BarChart3,
    label: 'Görünür ilerleme',
    desc: 'Trend ve yüzde ile motivasyonu koruyun',
  },
] as const;

export function LandingOutcomeStrip() {
  return (
    <section className="relative border-b border-stone-100 py-8 dark:border-stone-800 sm:py-10">
      <div className="landing-vibe-mesh absolute inset-0 opacity-60 dark:opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {OUTCOMES.map(({ icon: Icon, label, desc }, i) => (
            <LandingReveal key={label} delay={i * 60}>
              <div className="landing-glass-card landing-hover-lift rounded-2xl p-5 text-center sm:text-left">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100/90 text-primary-700 dark:bg-primary-950/80 dark:text-primary-300 sm:mx-0">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <p className="font-display text-base font-bold text-stone-900 dark:text-stone-100">{label}</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{desc}</p>
              </div>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
