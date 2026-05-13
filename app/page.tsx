/**
 * Landing Page
 * Eğitim içeriği odaklı, yeni nesil UX/UI – responsive & mobil uyumlu
 */

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { unstable_cache } from 'next/cache';
import { getBaseUrl } from '@/lib/seo/baseUrl';
import { getOrganizationSameAs } from '@/lib/seo/siteSeo';
import { getSettingBoolean, SITE_KEYS } from '@/lib/siteSettings';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import {
  BookOpen,
  Users,
  ArrowRight,
  CheckCircle,
  Target,
  BarChart3,
  GraduationCap,
  Library,
  ClipboardCheck,
  Sparkles,
  TrendingUp,
  Award,
  UserPlus,
  ListChecks,
  MessageCircle,
  HelpCircle,
  Instagram,
  Linkedin,
  Youtube,
  Facebook,
  Shield,
  Lock,
  Zap,
  Building2,
} from 'lucide-react';

const MobileLandingCta = dynamic(
  () => import('@/components/layout/MobileLandingCta').then((m) => ({ default: m.MobileLandingCta })),
  { ssr: false, loading: () => null },
);

const ShopierCheckoutLink = dynamic(
  () => import('@/components/checkout/ShopierCheckoutLink').then((m) => m.ShopierCheckoutLink),
  { ssr: false, loading: () => null },
);

const getShowPartnersCached = () =>
  unstable_cache(
    async () => getSettingBoolean(SITE_KEYS.LANDING_SHOW_PARTNERS),
    ['site-setting-landing_show_partners'],
    { revalidate: 60 }
  )();

export default async function LandingPage() {
  const baseUrl = getBaseUrl();
  const showPartners = await getShowPartnersCached();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'The Goal Lab',
        description: 'Kurumlar ve bireyler için hedef ve sınav takip platformu. KPSS, ÖABT, ALES sınav hazırlığı.',
        inLanguage: 'tr-TR',
        publisher: { '@id': `${baseUrl}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'The Goal Lab',
        url: baseUrl,
        logo: { '@type': 'ImageObject', url: `${baseUrl}/icon.svg` },
        sameAs: getOrganizationSameAs(),
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${baseUrl}/#software`,
        name: 'The Goal Lab',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'TRY',
        },
        description:
          'Sınav ve konu takibi, hedef puan, deneme takibi. KPSS, ÖABT, ALES ve diğer sınavlar için kurumsal ve bireysel kullanım.',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 text-stone-900 dark:bg-stone-950 dark:text-stone-100 sm:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarketingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-24 lg:pb-20">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-primary-50/40 to-amber-50/50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(20,184,166,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(20,184,166,0.08),transparent)]" />
        <div className="absolute top-20 right-0 w-[min(80vw,420px)] h-[min(60vw,320px)] rounded-full bg-primary-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[min(70vw,380px)] h-[min(50vw,280px)] rounded-full bg-amber-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-20 items-center min-h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-8rem)]">
            {/* Left: Copy */}
            <div className="flex flex-col justify-center text-center lg:text-left order-1">
              <div className="mx-auto mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary-200 bg-white/90 px-3 py-1.5 text-sm font-medium text-primary-700 shadow-sm backdrop-blur-sm dark:border-primary-800 dark:bg-stone-900/90 dark:text-primary-300 sm:mb-6 lg:mx-0">
                <Sparkles className="h-4 w-4 text-amber-800 dark:text-amber-400" aria-hidden />
                <span>Sınav takibi artık tek ekranda</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 mb-4 sm:mb-5">
                Konuları takip et.
                <br />
                <span className="text-primary-800 dark:text-primary-200">
                  Hedefe ulaş.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-300 leading-relaxed mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 min-h-[5.25rem] sm:min-h-[4.75rem]">
                KPSS, ÖABT, ALES ve tüm sınavlar için ders ve konu takibinizi yapın. İlerlemeniz tek ekranda, net ve motive edici.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-6">
                <Link
                  href="/onboarding"
                  className="group w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 text-base font-bold text-white bg-gradient-to-r from-primary-700 to-primary-600 rounded-2xl hover:from-primary-800 hover:to-primary-700 transition-all shadow-xl shadow-primary-500/30 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Ücretsiz Başla
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex w-full items-center justify-center rounded-2xl border-2 border-stone-200 bg-white px-6 py-3.5 text-base font-semibold text-stone-700 transition-all hover:border-primary-300 hover:bg-primary-50/50 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-primary-700 dark:hover:bg-stone-800 sm:w-auto sm:px-8 sm:py-4"
                >
                  Giriş Yap
                </Link>
              </div>
              <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-stone-500 dark:text-stone-300 lg:justify-start">
                <span>Kredi kartı yok</span>
                <span className="text-stone-500 dark:text-stone-500" aria-hidden>
                  •
                </span>
                <span>2 dk kurulum</span>
                <span className="text-stone-500 dark:text-stone-500" aria-hidden>
                  •
                </span>
                <span>Ücretsiz başla</span>
              </p>
            </div>

            {/* Right: App preview card */}
            <div className="relative order-2 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary-500/20 to-amber-500/20 rounded-[1.75rem] blur-xl" />
                <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-soft-lg dark:border-stone-700 dark:bg-stone-900/95">
                  {/* Fake app header */}
                  <div className="flex items-center gap-3 border-b border-stone-100 bg-stone-50/80 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/80 sm:px-5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-stone-500 dark:text-stone-300">Dashboard</div>
                      <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">Sınav Takibim</div>
                    </div>
                  </div>
                  {/* Fake content */}
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-stone-600">Bu hafta hedef</span>
                      <span className="text-xs font-semibold text-primary-600">5/7 gün</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                      <div className="h-full w-[72%] bg-gradient-to-r from-primary-600 to-primary-700 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Tamamlanan konu', value: '12', icon: Target },
                        { label: 'Aktif sınav', value: 'KPSS', icon: TrendingUp },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="rounded-xl border border-stone-100 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-950/80">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-3.5 w-3.5 text-primary-600" />
                            <span className="text-xs text-stone-500">{label}</span>
                          </div>
                          <span className="font-display font-bold text-stone-900 dark:text-stone-100">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
                      <span>İlerleme %68</span>
                      <span className="font-medium text-primary-600">Detay →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Güven bandı + değer özetleri (satış odaklı, yanıltıcı rakam yok) */}
      <section className="border-y border-stone-100 bg-white py-10 dark:border-stone-800 dark:bg-stone-900 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-stone-600 dark:text-stone-300">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 shrink-0 text-primary-600" aria-hidden />
              <span>Şeffaf ilerleme takibi</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 shrink-0 text-primary-600" aria-hidden />
              <span>Hesabınıza özel veri</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 shrink-0 text-primary-600" aria-hidden />
              <span>Dakikalar içinde ilk sınavınız</span>
            </div>
          </div>
          <div className="mx-auto mt-10 max-w-3xl border-t border-stone-100 pt-10 text-center dark:border-stone-800">
            <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl lg:text-4xl">
              Planınız net, risk yok
            </h2>
            <p className="mt-3 text-base text-stone-600 dark:text-stone-300 sm:text-lg">
              Kredi kartı olmadan deneyin. İhtiyaç duyduğunuzda Pro&apos;yu Shopier üzerinden satın alarak pomodoro geçmişi ve gelişmiş analitiklere geçebilirsiniz.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {[
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
            ].map(({ title, desc, icon: Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-stone-100 bg-stone-50/80 p-6 dark:border-stone-800 dark:bg-stone-950/60"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/20">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Desteklenen Sınavlar */}
      <section className="py-12 sm:py-16 bg-stone-50 dark:bg-stone-950 border-y border-stone-100 dark:border-stone-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              Desteklenen Sınavlar
            </h2>
            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base max-w-xl mx-auto">
              KPSS, öğretmenlik, lisansüstü ve yabancı dil sınavları dahil tüm yapıyı kendiniz tanımlayıp takip edebilirsiniz.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {['KPSS', 'ÖABT', 'ALES', 'DGS', 'YDS', 'YÖKDİL', 'TUS', 'DUS', 'Diğer'].map((exam) => (
              <span
                key={exam}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50/50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-primary-700"
              >
                <Award className="h-4 w-4 text-primary-600" />
                {exam}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Kimler için */}
      <section id="kimler" className="border-y border-stone-100 bg-stone-50 py-14 dark:border-stone-800 dark:bg-stone-950 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
            <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl lg:text-4xl">
              Kimler için?
            </h2>
            <p className="mt-2 text-stone-600 dark:text-stone-300 sm:text-lg">
              Bireysel adaydan kurumsal ekibe kadar aynı net panel; rolünüze göre derinleşir.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {[
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
            ].map(({ title, desc, icon: Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900/90 sm:p-8"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="ozellikler" className="py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-3 sm:mb-4">
              Neden The Goal Lab?
            </h2>
            <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
              Modern araçlarla sınav hazırlığınızı bir üst seviyeye taşıyın
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
            <div className="group relative rounded-3xl border border-stone-100 bg-white p-6 transition-all duration-300 hover:border-primary-200 hover:shadow-soft-lg dark:border-stone-800 dark:bg-stone-900/90 dark:hover:border-primary-800 sm:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl mb-5 sm:mb-6 shadow-lg shadow-primary-500/25 text-white">
                  <Target className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2 sm:mb-3">Hedefli Takip</h3>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-sm sm:text-base">
                  Her konuyu detaylı takip edin. Tamamlanan, devam eden ve henüz başlanmamış konuları bir bakışta görün.
                </p>
              </div>
            </div>
            <div className="group relative rounded-3xl border border-stone-100 bg-white p-6 transition-all duration-300 hover:border-primary-200 hover:shadow-soft-lg dark:border-stone-800 dark:bg-stone-900/90 dark:hover:border-primary-800 sm:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-700 to-amber-800 rounded-2xl mb-5 sm:mb-6 shadow-lg shadow-amber-700/25 text-white">
                  <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2 sm:mb-3">Görsel İstatistikler</h3>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-sm sm:text-base">
                  İlerlemenizi grafikler ve istatistiklerle görselleştirin. Hangi konularda ne kadar ilerleme kaydettiğinizi anında görün.
                </p>
              </div>
            </div>
            <div className="group relative rounded-3xl border border-stone-100 bg-white p-6 transition-all duration-300 hover:border-primary-200 hover:shadow-soft-lg dark:border-stone-800 dark:bg-stone-900/90 dark:hover:border-primary-800 sm:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-amber-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-700 to-primary-800 rounded-2xl mb-5 sm:mb-6 shadow-lg shadow-primary-700/25 text-white">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2 sm:mb-3">Ekip Yönetimi</h3>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-sm sm:text-base">
                  Kurumlar için özel yönetim paneli. Tüm ekibinizin ilerlemesini merkezi olarak takip edin ve raporlayın.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır? */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white dark:bg-stone-900 border-y border-stone-100 dark:border-stone-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-3 sm:mb-4">
              Nasıl Çalışır?
            </h2>
            <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
              Üç adımda sınav takibinize başlayın
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {[
              { step: 1, title: 'Ücretsiz kayıt ol', desc: 'E-posta ile hesap oluşturun. Kredi kartı gerekmez.', icon: UserPlus },
              { step: 2, title: 'Sınav ve konuları seç', desc: 'Hedef sınavınızı seçin, ders ve konu yapısı hazır veya kendiniz ekleyin.', icon: ListChecks },
              { step: 3, title: 'Takip et, hedefe ulaş', desc: 'İlerlemenizi güncelleyin, istatistikleri görün ve hedefe doğru ilerleyin.', icon: Target },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/25 mb-4">
                  <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <div className="absolute -top-1 -right-1 flex items-center justify-center w-7 h-7 rounded-full bg-amber-800 text-white text-sm font-bold">
                  {step}
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">{title}</h3>
                <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 text-primary-700 font-semibold hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200 transition-colors"
            >
              Hemen başla
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Paket özeti */}
      <section id="paketler" className="border-y border-stone-100 bg-stone-50 py-16 dark:border-stone-800 dark:bg-stone-950 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
            <h2 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl">
              Ücretsiz başlayın, büyüdükçe Pro
            </h2>
            <p className="mt-3 text-lg text-stone-600 dark:text-stone-300">
              Temel sınav ve konu takibi her zaman ücretsiz. Pro ve gelişmiş özellikler için ödeme güvenli şekilde Shopier üzerinden yapılır.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <div className="flex flex-col rounded-3xl border-2 border-stone-200 bg-white p-8 dark:border-stone-700 dark:bg-stone-900/90">
              <p className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-300">Ücretsiz</p>
              <p className="font-display mt-2 text-3xl font-bold text-stone-900 dark:text-stone-100">0 ₺</p>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Sınav, ders ve konu takibi; dashboard; deneme kayıtları.</p>
              <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-stone-700 dark:text-stone-300">
                {['Sınırsız sınav / ders / konu (politikaya tabi)', 'İlerleme ve temel istatistikler', 'Mobil uyumlu arayüz'].map((line) => (
                  <li key={line} className="flex gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/onboarding"
                className="mt-8 inline-flex w-full items-center justify-center rounded-2xl border-2 border-stone-300 py-3.5 text-center text-sm font-bold text-stone-800 transition-colors hover:border-primary-400 hover:bg-primary-50 dark:border-stone-600 dark:text-stone-100 dark:hover:border-primary-600 dark:hover:bg-stone-800"
              >
                Ücretsiz kayıt ol
              </Link>
            </div>
            <div className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-primary-500 bg-gradient-to-b from-primary-50/90 to-white p-8 dark:from-primary-950/40 dark:to-stone-900/90 dark:border-primary-600">
              <div className="absolute right-4 top-4 rounded-full bg-primary-800 px-2.5 py-0.5 text-xs font-bold text-white dark:bg-primary-700">
                Pro
              </div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-800 dark:text-primary-300">Profesyonel</p>
              <p className="font-display mt-2 text-3xl font-bold text-stone-900 dark:text-stone-100">İhtiyaca göre</p>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Pomodoro geçmişi ve gelişmiş analitik; yüksek kullanım limitleri.</p>
              <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-stone-700 dark:text-stone-300">
                {['Ücretsiz plandaki her şey', 'Pomodoro oturum geçmişi ve istatistikleri', 'Öncelikli kullanım kotası ve özellikler'].map((line) => (
                  <li key={line} className="flex gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <ShopierCheckoutLink className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary-700 to-primary-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-transform hover:scale-[1.01] active:scale-[0.99]">
                Pro&apos;yu Shopier&apos;da satın al
              </ShopierCheckoutLink>
            </div>
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-stone-500 dark:text-stone-300">
            Pro satın alma Shopier üzerinden tamamlanır. Ücretsiz hesap için kayıt yeterlidir; taahhüt yoktur.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white dark:bg-stone-900 border-y border-stone-100 dark:border-stone-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-4 sm:mb-6">
                Her detayı kontrol edin
              </h2>
              <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-300 mb-6 sm:mb-8 leading-relaxed">
                Karmaşık sınav yapılarını bile kolayca yönetin. Her sınav için dersleri, her ders için konuları tanımlayın ve ilerlemenizi anlık takip edin.
              </p>
              <ul className="space-y-3 sm:space-y-4">
                {[
                  'Sınırsız sınav, ders ve konu ekleme',
                  'Gerçek zamanlı ilerleme takibi',
                  'Kurumsal rol yönetimi',
                  'Güvenli veri saklama',
                  'Mobil uyumlu arayüz',
                  'Detaylı raporlama araçları',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-primary-600 rounded-lg text-white">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    </div>
                    <span className="text-stone-700 font-medium text-base sm:text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-amber-500/10 rounded-3xl blur-3xl" />
              <div className="relative rounded-3xl border border-stone-200 bg-stone-50 p-6 shadow-soft-lg dark:border-stone-700 dark:bg-stone-950/80 sm:p-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between rounded-2xl border border-primary-100 bg-white p-4 dark:border-primary-900/50 dark:bg-stone-900/90 sm:p-6">
                    <div>
                      <p className="font-display font-bold text-stone-900 dark:text-stone-100 text-base sm:text-lg mb-0.5">Aktif Sınavlar</p>
                      <p className="text-xs sm:text-sm text-stone-500">Şu anda devam eden</p>
                    </div>
                    <span className="font-display text-3xl sm:text-4xl font-extrabold text-primary-700">12</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-amber-100 bg-white p-4 dark:border-amber-900/40 dark:bg-stone-900/90 sm:p-6">
                    <div>
                      <p className="font-display font-bold text-stone-900 dark:text-stone-100 text-base sm:text-lg mb-0.5">Tamamlanan Konular</p>
                      <p className="text-xs sm:text-sm text-stone-500">Bu ay içinde</p>
                    </div>
                    <span className="font-display text-3xl sm:text-4xl font-extrabold text-amber-800 dark:text-amber-400">247</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-primary-100 bg-white p-4 dark:border-primary-900/50 dark:bg-stone-900/90 sm:p-6">
                    <div>
                      <p className="font-display font-bold text-stone-900 dark:text-stone-100 text-base sm:text-lg mb-0.5">Genel İlerleme</p>
                      <p className="text-xs sm:text-sm text-stone-500">Tüm sınavlar için</p>
                    </div>
                    <span className="font-display text-3xl sm:text-4xl font-extrabold text-primary-700">84%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kullanıcı Yorumları */}
      <section id="yorumlar" className="py-16 sm:py-24 lg:py-32 bg-stone-50 dark:bg-stone-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-3 sm:mb-4">
              Kullanıcılarımız Ne Diyor?
            </h2>
            <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
              Adaylar ve kurumlar sınav takibini The Goal Lab ile sadeleştiriyor
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { quote: 'Konuları tek tek işaretleyebilmek ve haftalık hedefi görmek motivasyonumu artırıyor. KPSS için tam aradığım şeydi.', name: 'Ayşe K.', role: 'KPSS adayı' },
              { quote: 'ÖABT ders yapısını kendim girdim, tüm branşları takip ediyorum. Çok pratik.', name: 'Mehmet T.', role: 'Öğretmen adayı' },
              { quote: 'Kurum olarak deneme ve konu takibini tek platformda topladık. Raporlama da çok işimize yarıyor.', name: 'Eğitim Koordinatörü', role: 'Özel dersane' },
            ].map(({ quote, name, role }, i) => (
              <div key={i} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-soft dark:border-stone-700 dark:bg-stone-900/90 sm:p-8">
                <MessageCircle className="h-8 w-8 text-primary-700 dark:text-primary-400 mb-4" aria-hidden />
                <p className="text-stone-700 leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
                <div>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{name}</span>
                  <span className="text-stone-500 text-sm"> — {role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners - admin panelden açılıp kapatılabilir */}
      {showPartners && (
        <section className="py-16 sm:py-24 lg:py-32 bg-stone-50 dark:bg-stone-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-100 mb-3 sm:mb-4">
                Birlikte Çalıştığımız Kurumlar
              </h2>
              <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto">
                Türkiye&apos;nin önde gelen kurumları sınav takiplerini The Goal Lab ile yönetiyor
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {[
                { name: 'Milli Eğitim Bakanlığı', initials: 'MEB' },
                { name: 'Yükseköğretim Kurulu', initials: 'YÖK' },
                { name: 'ÖSYM', initials: 'ÖSYM' },
                { name: 'Kamu Personeli Seçme Kurumu', initials: 'KPSS' },
                { name: 'Adalet Bakanlığı', initials: 'ADL' },
                { name: 'Sağlık Bakanlığı', initials: 'SB' },
                { name: 'İçişleri Bakanlığı', initials: 'İB' },
                { name: 'Maliye Bakanlığı', initials: 'MB' },
              ].map((institution, index) => (
                <div
                  key={index}
                  className="group rounded-2xl border border-stone-200 bg-white p-6 transition-all duration-300 hover:border-primary-300 hover:shadow-soft dark:border-stone-700 dark:bg-stone-900/90 dark:hover:border-primary-700 sm:p-8"
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl text-white font-display font-bold text-sm sm:text-lg shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
                      {institution.initials}
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-stone-600 transition-colors group-hover:text-stone-900 dark:text-stone-300 dark:group-hover:text-stone-100">
                      {institution.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 sm:mt-12 text-center text-stone-500 text-sm sm:text-base">
              +100&apos;den fazla kamu kurumu ve özel eğitim kurumu The Goal Lab kullanıyor
            </p>
          </div>
        </section>
      )}

      {/* SSS (kısa özet + link) */}
      <section className="py-12 sm:py-16 bg-white dark:bg-stone-900 border-y border-stone-100 dark:border-stone-800">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base">
              Merak ettiklerinizin yanıtları
            </p>
          </div>
          <div className="space-y-4 mb-8">
            {[
              { q: 'The Goal Lab ücretsiz mi?', a: 'Evet. Ücretsiz plan ile kayıt olup sınav ve konu takibinizi yapabilirsiniz.' },
              { q: 'Hangi sınavları destekliyorsunuz?', a: 'KPSS, ÖABT, ALES, DGS, YDS ve daha fazlası. Sınav yapısını siz tanımlayabilir veya hazır şablonlardan seçebilirsiniz.' },
            ].map(({ q, a }, i) => (
              <div key={i} className="rounded-xl border border-stone-100 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60 sm:p-5">
                <div className="flex gap-3">
                  <HelpCircle className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">{q}</h3>
                    <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed">{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center">
            <Link href="/sss" className="text-primary-700 font-semibold hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200 transition-colors inline-flex items-center gap-1">
              Tüm sorular
              <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:24px_24px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-4 sm:mb-6">
              Hemen Başlayın
            </h2>
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-primary-50 mb-10 sm:mb-12 leading-relaxed">
              Ücretsiz hesap oluşturun ve sınav takibinize bugün başlayın. Kredi kartı gerektirmez, sadece 30 saniye sürer.
            </p>
            <Link
              href="/onboarding"
              className="group inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-base font-bold text-primary-800 shadow-xl transition-all hover:scale-[1.02] hover:bg-stone-50 hover:shadow-2xl active:scale-[0.98] dark:bg-white dark:text-primary-800 dark:hover:bg-stone-100 sm:px-8 sm:py-4 sm:text-lg"
            >
              Ücretsiz Hesap Oluştur
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 dark:border-stone-800 dark:bg-stone-900 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-600 text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="font-display text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">The Goal Lab</span>
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                <Link href="/sss" className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-primary-600 transition-colors">
                  Sıkça Sorulan Sorular
                </Link>
                <Link href="/destek" className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-primary-600 transition-colors">
                  Destek
                </Link>
                <Link href="/auth/login" className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-primary-600 transition-colors hidden sm:block">
                  Giriş Yap
                </Link>
                <Link href="/onboarding" className="text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-primary-600 transition-colors hidden sm:block">
                  Başla
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-stone-100 pt-4 dark:border-stone-800 sm:flex-row">
              <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base order-last sm:order-first">
                © {new Date().getFullYear()} The Goal Lab. Tüm hakları saklıdır.
              </p>
              <div className="flex items-center gap-2">
                {[
                  { href: 'https://x.com', icon: ({ className }: { className?: string }) => <span className={`inline-flex items-center justify-center text-sm font-bold ${className ?? ''}`}>𝕏</span>, label: 'X' },
                  { href: 'https://instagram.com/zeosoft.io', icon: Instagram, label: 'Instagram' },
                  { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
                  { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
                  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
                ].map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600 transition-colors hover:bg-primary-100 hover:text-primary-600 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-primary-950 dark:hover:text-primary-400"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <MobileLandingCta />
    </div>
  );
}
