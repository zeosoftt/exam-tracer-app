import { MessageCircle } from 'lucide-react';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader';

const TESTIMONIALS = [
  {
    quote:
      'Konuları tek tek işaretleyebilmek ve haftalık hedefi görmek motivasyonumu artırıyor. KPSS için tam aradığım şeydi.',
    name: 'Ayşe K.',
    role: 'KPSS adayı',
  },
  {
    quote: 'ÖABT ders yapısını kendim girdim, tüm branşları takip ediyorum. Çok pratik.',
    name: 'Mehmet T.',
    role: 'Öğretmen adayı',
  },
  {
    quote: 'Kurum olarak deneme ve konu takibini tek platformda topladık. Raporlama da çok işimize yarıyor.',
    name: 'Eğitim Koordinatörü',
    role: 'Özel dershane',
  },
] as const;

export function LandingTestimonials() {
  return (
    <section id="yorumlar" className="relative py-16 sm:py-24 lg:py-32">
      <div className="landing-vibe-mesh absolute inset-0 opacity-45 dark:opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <LandingSectionHeader
          eyebrow="KULLANICI DENEYİMİ"
          title="Kullanıcılarımız Ne Diyor?"
          description="Adaylar ve kurumlar sınav takibini The Goal Lab ile sadeleştiriyor"
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {TESTIMONIALS.map(({ quote, name, role }, i) => (
            <LandingReveal key={name} delay={i * 70}>
              <blockquote className="landing-glass-card landing-hover-lift relative h-full rounded-2xl p-6 sm:p-8">
                <span className="landing-quote-mark pointer-events-none absolute left-4 top-3 font-display text-5xl leading-none text-primary-200 dark:text-primary-900/60" aria-hidden>
                  &ldquo;
                </span>
                <MessageCircle className="relative mb-4 h-7 w-7 text-primary-700 dark:text-primary-400" aria-hidden />
                <p className="relative text-sm leading-relaxed text-stone-700 dark:text-stone-300 sm:text-base">
                  &ldquo;{quote}&rdquo;
                </p>
                <footer className="mt-5 border-t border-stone-100 pt-4 dark:border-stone-800">
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{name}</span>
                  <span className="text-sm text-stone-500"> — {role}</span>
                </footer>
              </blockquote>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
