import Link from 'next/link';
import { ArrowRight, ListChecks, Target, UserPlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader';

const STEPS: Array<{ step: number; title: string; desc: string; icon: LucideIcon }> = [
  { step: 1, title: 'Ücretsiz kayıt ol', desc: 'E-posta ile hesap oluşturun. Kredi kartı gerekmez.', icon: UserPlus },
  { step: 2, title: 'Sınav ve konuları seç', desc: 'Hedef sınavınızı seçin, ders ve konu yapısı hazır veya kendiniz ekleyin.', icon: ListChecks },
  { step: 3, title: 'Takip et, hedefe ulaş', desc: 'İlerlemenizi güncelleyin, istatistikleri görün ve hedefe doğru ilerleyin.', icon: Target },
];

export function LandingHowItWorks() {
  return (
    <section id="nasil" className="relative border-y border-stone-100 py-12 dark:border-stone-800 sm:py-24 lg:py-32">
      <div className="landing-dot-grid absolute inset-0 opacity-15 dark:opacity-[0.06]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <LandingSectionHeader
          eyebrow="3 ADIM"
          title="Nasıl Çalışır?"
          description="Üç adımda sınav takibinize başlayın"
        />

        <div className="relative grid grid-cols-1 gap-5 overflow-visible sm:gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map(({ step, title, desc, icon: Icon }, i) => (
            <LandingReveal key={step} delay={i * 90} className="h-full overflow-visible">
              <div className="landing-hover-lift relative flex h-full flex-col items-center overflow-visible rounded-2xl border border-stone-200/80 bg-white p-5 text-center shadow-sm dark:border-stone-700/80 dark:bg-stone-900 sm:rounded-3xl sm:p-8">
                <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-amber-800 text-sm font-bold text-white shadow-md sm:right-4 sm:top-4">
                  {step}
                </span>
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/25 sm:h-16 sm:w-16">
                  <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <h3 className="mb-2 px-1 font-display text-lg font-bold text-stone-900 dark:text-stone-100 sm:text-xl md:text-2xl">
                  {title}
                </h3>
                <p className="max-w-xs px-1 text-sm leading-relaxed text-stone-600 dark:text-stone-300 sm:text-base">{desc}</p>
              </div>
            </LandingReveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/onboarding"
            className="landing-vibe-cta inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 bg-[length:200%_100%] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-transform hover:scale-[1.02] sm:w-auto sm:text-base"
          >
            Hemen başla
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
