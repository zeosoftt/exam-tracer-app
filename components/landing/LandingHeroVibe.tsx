import Link from 'next/link';
import { ArrowRight, BookOpen, Sparkles, Target, TrendingUp } from 'lucide-react';
import { LandingHeroAnchors } from '@/components/landing/LandingHeroAnchors';

const EXAM_PILLS = ['KPSS', 'ÖABT', 'ALES', 'YKS', 'DGS', 'YDS', 'TYT', 'AYT'] as const;

const MINI_BARS = [42, 58, 51, 72, 68, 80, 74] as const;

export function LandingHeroVibe() {
  return (
    <section className="landing-vibe-hero relative overflow-hidden pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-24 lg:pb-20">
      <div className="landing-vibe-mesh absolute inset-0" aria-hidden />
      <div className="landing-dot-grid absolute inset-0 opacity-[0.35] dark:opacity-[0.12]" aria-hidden />
      <div className="landing-grain pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]" aria-hidden />

      <div
        className="landing-orb absolute top-16 right-0 h-[min(60vw,320px)] w-[min(80vw,420px)] rounded-full bg-primary-400/10 blur-3xl"
        aria-hidden
      />
      <div
        className="landing-orb landing-orb--amber absolute bottom-0 left-0 h-[min(50vw,280px)] w-[min(70vw,380px)] rounded-full bg-amber-400/15 blur-3xl"
        aria-hidden
      />
      <div
        className="landing-orb landing-orb--slow absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-primary-300/5 blur-2xl sm:h-64 sm:w-64"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-[calc(100vh-6rem)] items-center gap-10 lg:min-h-[calc(100vh-8rem)] lg:grid-cols-2 lg:gap-14 xl:gap-20">
          <div className="order-1 flex flex-col justify-center text-center lg:text-left">
            <div className="landing-hero-in landing-badge-pulse mx-auto mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary-200/80 bg-white/70 px-3 py-1.5 text-sm font-medium text-primary-800 shadow-sm backdrop-blur-md dark:border-primary-800/60 dark:bg-stone-900/70 dark:text-primary-200 sm:mb-6 lg:mx-0">
              <Sparkles className="h-4 w-4 text-amber-700 dark:text-amber-400" aria-hidden />
              <span className="landing-section-eyebrow text-[11px] tracking-[0.14em] text-primary-800 dark:text-primary-200">
                SINAV HAZIRLIĞI · TEK PANEL
              </span>
            </div>

            <h1 className="landing-hero-in landing-hero-in-1 font-display mb-4 text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 sm:mb-5 sm:text-5xl lg:text-5xl xl:text-6xl">
              KPSS, ALES, ÖABT ve YKS için
              <br />
              <span className="landing-gradient-text">konu ve deneme takibi</span>
            </h1>

            <p className="landing-hero-in landing-hero-in-2 mx-auto mb-6 max-w-xl text-lg leading-relaxed text-stone-600 dark:text-stone-300 sm:mb-8 sm:text-xl lg:mx-0">
              The Goal Lab ile hazırlığını tek ekranda topla — konu ilerlemesi, deneme kaydı, net trendi ve
              hedef puan takibi. DGS, TYT/AYT dahil.
            </p>

            <div className="landing-hero-in landing-hero-in-3 mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start">
              <Link
                href="/onboarding"
                className="landing-vibe-cta group inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 bg-[length:200%_100%] px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-primary-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto sm:px-8 sm:py-4"
              >
                Ücretsiz Başla
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-stone-200/80 bg-white/60 px-6 py-3.5 text-base font-semibold text-stone-700 backdrop-blur-sm transition-all hover:border-primary-300 hover:bg-white/90 dark:border-stone-600/80 dark:bg-stone-900/60 dark:text-stone-200 dark:hover:border-primary-700 dark:hover:bg-stone-900/90 sm:w-auto sm:px-8 sm:py-4"
              >
                Giriş Yap
              </Link>
            </div>

            <p className="landing-hero-in landing-hero-in-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-stone-500 dark:text-stone-400 lg:justify-start">
              <span>Kredi kartı yok</span>
              <span aria-hidden>·</span>
              <span>2 dk kurulum</span>
              <span aria-hidden>·</span>
              <span>Ücretsiz başla</span>
            </p>

            <LandingHeroAnchors />

            <div className="landing-hero-in landing-hero-in-4 mt-8 overflow-hidden lg:mt-10">
              <div className="landing-marquee-mask">
                <div className="landing-marquee-track flex w-max gap-2">
                  {[...EXAM_PILLS, ...EXAM_PILLS].map((exam, i) => (
                    <span
                      key={`${exam}-${i}`}
                      className="landing-exam-pill inline-flex shrink-0 rounded-full border border-stone-200/80 bg-white/50 px-3 py-1 text-xs font-semibold text-stone-600 backdrop-blur-sm dark:border-stone-700/80 dark:bg-stone-900/50 dark:text-stone-300"
                    >
                      {exam}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="landing-hero-in landing-hero-in-2 relative order-2 flex justify-center lg:justify-end">
            <div className="landing-card-float relative w-full max-w-md">
              <div
                className="absolute -inset-3 rounded-[1.85rem] bg-gradient-to-br from-primary-500/25 via-transparent to-amber-500/20 blur-2xl"
                aria-hidden
              />
              <div className="landing-vibe-glass relative overflow-hidden rounded-3xl border border-white/60 shadow-soft-lg dark:border-stone-700/80">
                <div className="flex items-center gap-3 border-b border-stone-100/80 bg-stone-50/70 px-4 py-3 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/70 sm:px-5">
                  <div className="flex gap-1.5" aria-hidden>
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-stone-400">Dashboard</div>
                      <div className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
                        Sınav Takibim
                      </div>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    CANLI
                  </span>
                </div>

                <div className="space-y-4 p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-600 dark:text-stone-400">Bu hafta hedef</span>
                    <span className="text-xs font-semibold tabular-nums text-primary-600 dark:text-primary-400">
                      5/7 gün
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                    <div className="landing-shimmer h-full w-[72%] rounded-full bg-gradient-to-r from-primary-600 via-primary-400 to-primary-700" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Tamamlanan konu', value: '12', icon: Target },
                      { label: 'Aktif sınav', value: 'KPSS', icon: TrendingUp },
                    ].map(({ label, value, icon: Icon }) => (
                      <div
                        key={label}
                        className="rounded-xl border border-stone-100/80 bg-stone-50/80 p-3 dark:border-stone-800 dark:bg-stone-950/60"
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-primary-600" />
                          <span className="text-xs text-stone-500 dark:text-stone-400">{label}</span>
                        </div>
                        <span className="font-display text-lg font-bold tabular-nums text-stone-900 dark:text-stone-100">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-stone-100/80 bg-stone-50/50 p-3 dark:border-stone-800 dark:bg-stone-950/40">
                    <div className="mb-2 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                      <span>Son 7 deneme · net</span>
                      <span className="font-semibold text-primary-600 dark:text-primary-400">Ort. 68.4</span>
                    </div>
                    <div className="flex h-14 items-end gap-1">
                      {MINI_BARS.map((h, i) => (
                        <div
                          key={i}
                          className="landing-stat-bar flex-1 rounded-t-md bg-gradient-to-t from-primary-700 to-primary-400 opacity-90"
                          style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-stone-500 dark:text-stone-400">
                    <span>İlerleme %68</span>
                    <span className="font-medium text-primary-600 dark:text-primary-400">Detay →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
