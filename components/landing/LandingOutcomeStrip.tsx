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
    <section className="border-b border-stone-100 bg-white py-8 dark:border-stone-800 dark:bg-stone-900 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          {OUTCOMES.map(({ icon: Icon, label, desc }, i) => (
            <LandingReveal key={label} delay={i * 60} className="text-center sm:text-left">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 sm:mx-0">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <p className="font-display text-base font-bold text-stone-900 dark:text-stone-100">{label}</p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{desc}</p>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
