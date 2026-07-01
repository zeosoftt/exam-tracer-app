import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LandingReveal } from '@/components/landing/LandingReveal';

export function LandingFinalCta() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700" />
      <div className="landing-dot-grid absolute inset-0 opacity-20" aria-hidden />
      <div className="landing-grain pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:24px_24px]" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <LandingReveal className="text-center">
          <p className="landing-section-eyebrow mb-4 text-xs font-bold tracking-[0.16em] text-primary-200">
            HEMEN BAŞLA
          </p>
          <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            Hemen Başlayın
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-primary-50 sm:text-xl">
            Ücretsiz hesap oluşturun ve sınav takibinize bugün başlayın. Kredi kartı gerektirmez.
          </p>
          <Link
            href="/onboarding"
            className="group mt-10 inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-base font-bold text-primary-800 shadow-xl transition-all hover:scale-[1.02] hover:bg-stone-50 hover:shadow-2xl active:scale-[0.98] sm:px-8 sm:py-4 sm:text-lg"
          >
            Ücretsiz Hesap Oluştur
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </LandingReveal>
      </div>
    </section>
  );
}
