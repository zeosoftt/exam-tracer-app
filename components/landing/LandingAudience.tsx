import { Building2, GraduationCap, Users } from 'lucide-react';
import { LandingReveal } from '@/components/landing/LandingReveal';
import { LandingSectionHeader } from '@/components/landing/LandingSectionHeader';

const AUDIENCES = [
  {
    title: 'Bireysel aday',
    desc: 'KPSS, ÖABT veya ALES — konu takibi, deneme ve hedef puanı tek hesapta.',
    icon: GraduationCap,
  },
  {
    title: 'Kurs ve dershane',
    desc: 'Şubeler ve sınıflar için merkezi takip; öğrenci ilerlemesini raporlamaya hazır veri.',
    icon: Users,
  },
  {
    title: 'Kurum ve koordinasyon',
    desc: 'Rol yönetimi ve ekip görünürlüğü ile kurumsal sınav hazırlığını tek çatıda toplayın.',
    icon: Building2,
  },
] as const;

export function LandingAudience() {
  return (
    <section id="kimler" className="relative py-14 sm:py-16">
      <div className="landing-vibe-mesh absolute inset-0 opacity-40 dark:opacity-25" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <LandingSectionHeader
          eyebrow="KİMLER İÇİN"
          title="Kimler için?"
          description="Bireysel adaydan kurumsal ekibe kadar aynı net panel; rolünüze göre derinleşir."
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {AUDIENCES.map(({ title, desc, icon: Icon }, i) => (
            <LandingReveal key={title} delay={i * 70}>
              <article className="landing-glass-card landing-hover-lift h-full rounded-2xl p-6 sm:p-8">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100/90 text-primary-700 dark:bg-primary-950/80 dark:text-primary-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{desc}</p>
              </article>
            </LandingReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
