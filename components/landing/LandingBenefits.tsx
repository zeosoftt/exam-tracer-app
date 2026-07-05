import { CheckCircle } from 'lucide-react';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader';

const FEATURES = [
  'Sınırsız sınav, ders ve konu ekleme',
  'Gerçek zamanlı ilerleme takibi',
  'Kurumsal rol yönetimi',
  'Güvenli veri saklama',
  'Mobil uyumlu arayüz',
  'Detaylı raporlama araçları',
] as const;

const PREVIEW_ITEMS = [
  { label: 'Haftalık hedef', sub: 'Çalışma günü takibi', tone: 'primary' as const },
  { label: 'Tamamlanan konular', sub: 'Sınav bazlı ilerleme', tone: 'amber' as const },
  { label: 'Genel ilerleme', sub: 'Tüm sınavlar için özet', tone: 'primary' as const },
] as const;

const statBorder = {
  primary: 'border-primary-100 dark:border-primary-900/50',
  amber: 'border-amber-100 dark:border-amber-900/40',
} as const;

const statValue = {
  primary: 'text-primary-600 dark:text-primary-400',
  amber: 'text-amber-700 dark:text-amber-400',
} as const;

export function LandingBenefits() {
  return (
    <section className="relative border-y border-stone-100 py-16 dark:border-stone-800 sm:py-24 lg:py-32">
      <div className="landing-dot-grid absolute inset-0 opacity-15 dark:opacity-[0.06]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <LandingReveal>
            <LandingSectionHeader
              align="left"
              eyebrow="KONTROL SİZDE"
              title="Her detayı kontrol edin"
              description="Karmaşık sınav yapılarını bile kolayca yönetin. Her sınav için dersleri, her ders için konuları tanımlayın ve ilerlemenizi anlık takip edin."
              className="mb-0 sm:mb-0"
            />
            <ul className="mt-8 space-y-3 sm:space-y-4">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3 sm:gap-4">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-base font-medium text-stone-700 dark:text-stone-200 sm:text-lg">{feature}</span>
                </li>
              ))}
            </ul>
          </LandingReveal>

          <LandingReveal delay={100}>
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-500/20 to-amber-500/10 blur-3xl" aria-hidden />
              <div className="landing-vibe-glass relative rounded-3xl p-6 sm:p-8">
                <div className="space-y-4 sm:space-y-5">
                  {PREVIEW_ITEMS.map(({ label, sub, tone }) => (
                    <div
                      key={label}
                      className={`landing-hover-lift flex items-center gap-4 rounded-2xl border bg-white/70 p-4 backdrop-blur-sm dark:bg-stone-900/70 sm:p-6 ${statBorder[tone]}`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tone === 'primary' ? 'from-primary-600 to-primary-700' : 'from-amber-600 to-amber-700'} text-white shadow-md`}>
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-display text-sm font-bold sm:text-base ${statValue[tone]}`}>{label}</p>
                        <p className="text-xs text-stone-500 sm:text-sm">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-center text-xs text-stone-500 dark:text-stone-400">
                  Örnek panel görünümü — gerçek veriler hesabınıza özeldir.
                </p>
              </div>
            </div>
          </LandingReveal>
        </div>
      </div>
    </section>
  );
}
