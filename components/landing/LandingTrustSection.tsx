import { BarChart3, ClipboardCheck, GraduationCap, Library, Lock, Shield, Zap } from 'lucide-react';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader';

const TRUST_ITEMS = [
  { icon: Shield, label: 'Şeffaf ilerleme takibi' },
  { icon: Lock, label: 'Hesabınıza özel veri' },
  { icon: Zap, label: 'Dakikalar içinde ilk sınavınız' },
] as const;

const VALUE_CARDS = [
  {
    title: 'Kendi ritminiz',
    desc: 'Konu konu işaretleyin; haftalık hedef ve ilerleme çubuklarıyla motive kalın.',
    icon: GraduationCap,
  },
  {
    title: 'Sınav yapınız sizde',
    desc: 'KPSS, ÖABT, ALES veya kurum içi sınav — ders ve konu ağacını kendiniz kurun.',
    icon: Library,
  },
  {
    title: 'Tek ekranda görünürlük',
    desc: 'Dashboard ve istatistiklerle hangi alanda geride kaldığınızı hemen görün.',
    icon: BarChart3,
  },
  {
    title: 'Denemeler tek yerde',
    desc: 'Deneme sonuçlarını kaydedin; gelişimi zaman içinde karşılaştırın.',
    icon: ClipboardCheck,
  },
] as const;

export function LandingTrustSection() {
  return (
    <section className="relative border-y border-stone-100 py-10 dark:border-stone-800 sm:py-12">
      <div className="landing-vibe-mesh absolute inset-0 opacity-50 dark:opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="landing-glass-card mx-auto flex max-w-3xl flex-col items-stretch gap-3 rounded-2xl px-4 py-4 text-sm text-stone-600 dark:text-stone-300 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-8 sm:gap-y-4 sm:px-6">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 sm:justify-center">
              <Icon className="h-5 w-5 shrink-0 text-primary-600" aria-hidden />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <LandingReveal className="mx-auto mt-10 max-w-3xl text-center">
          <LandingSectionHeader
            eyebrow="RİSK YOK · NET PLAN"
            title="Planınız net, risk yok"
            description="Kredi kartı olmadan deneyin. İhtiyaç duyduğunuzda Pro'yu Shopier üzerinden satın alarak deneme takibi ve gelişmiş analitiklere geçebilirsiniz."
          />
        </LandingReveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {VALUE_CARDS.map(({ title, desc, icon: Icon }, i) => (
            <LandingReveal key={title} delay={i * 60}>
              <div className="landing-glass-card landing-hover-lift h-full rounded-2xl p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{desc}</p>
              </div>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
