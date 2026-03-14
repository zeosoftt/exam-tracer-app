/**
 * Landing Page
 * Eğitim içeriği odaklı, yeni nesil UX/UI – responsive & mobil uyumlu
 */

import Link from 'next/link';
import { BookOpen, Users, ArrowRight, CheckCircle, Target, BarChart3, GraduationCap, Library, FileCheck, ClipboardCheck, Sparkles, TrendingUp, Award, UserPlus, ListChecks, MessageCircle, HelpCircle, Instagram, Linkedin, Youtube, Facebook } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-stone-100 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="font-display text-xl sm:text-2xl font-bold text-stone-900">
                The Goal Lab
              </span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-6">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors hidden sm:block"
              >
                Giriş Yap
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                Başla
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-24 lg:pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-primary-50/40 to-amber-50/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(20,184,166,0.12),transparent)]" />
        <div className="absolute top-20 right-0 w-[min(80vw,420px)] h-[min(60vw,320px)] rounded-full bg-primary-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[min(70vw,380px)] h-[min(50vw,280px)] rounded-full bg-amber-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-20 items-center min-h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-8rem)]">
            {/* Left: Copy */}
            <div className="flex flex-col justify-center text-center lg:text-left order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-primary-200 rounded-full text-sm font-medium text-primary-700 mb-5 sm:mb-6 w-fit mx-auto lg:mx-0 shadow-sm">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Sınav takibi artık tek ekranda</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-stone-900 mb-4 sm:mb-5">
                Konuları takip et.
                <br />
                <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-teal-500 bg-clip-text text-transparent">
                  Hedefe ulaş.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-stone-600 leading-relaxed mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
                KPSS, ÖABT, ALES ve tüm sınavlar için ders ve konu takibinizi yapın. İlerlemeniz tek ekranda, net ve motive edici.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-6">
                <Link
                  href="/onboarding"
                  className="group w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 text-base font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-xl shadow-primary-500/30 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Ücretsiz Başla
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 text-base font-semibold text-stone-700 bg-white border-2 border-stone-200 rounded-2xl hover:border-primary-200 hover:bg-primary-50/50 transition-all"
                >
                  Giriş Yap
                </Link>
              </div>
              <p className="text-sm text-stone-500 flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1">
                <span>Kredi kartı yok</span>
                <span className="text-stone-300">•</span>
                <span>2 dk kurulum</span>
                <span className="text-stone-300">•</span>
                <span>Ücretsiz başla</span>
              </p>
            </div>

            {/* Right: App preview card */}
            <div className="relative order-2 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary-500/20 to-amber-500/20 rounded-[1.75rem] blur-xl" />
                <div className="relative bg-white rounded-3xl border border-stone-200 shadow-soft-lg overflow-hidden">
                  {/* Fake app header */}
                  <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-stone-100 bg-stone-50/80">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-stone-500">Dashboard</div>
                      <div className="text-sm font-semibold text-stone-900 truncate">Sınav Takibim</div>
                    </div>
                  </div>
                  {/* Fake content */}
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-stone-600">Bu hafta hedef</span>
                      <span className="text-xs font-semibold text-primary-600">5/7 gün</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full w-[72%] bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Tamamlanan konu', value: '12', icon: Target },
                        { label: 'Aktif sınav', value: 'KPSS', icon: TrendingUp },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-3.5 w-3.5 text-primary-600" />
                            <span className="text-xs text-stone-500">{label}</span>
                          </div>
                          <span className="font-display font-bold text-stone-900">{value}</span>
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

      {/* Sayılarla The Goal Lab */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white border-y border-stone-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-600 mb-3 sm:mb-4">
              Sayılarla The Goal Lab
            </h2>
            <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto">
              Kurulduğu günden bu yana binlerce öğrencinin sınav hazırlığına destek olan The Goal Lab büyümeye devam ediyor.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-full max-w-[180px] mx-auto mb-4 sm:mb-5">
                <div className="aspect-square rounded-[2rem] bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center p-6 shadow-lg shadow-primary-500/25">
                  <div className="absolute inset-0 rounded-[2rem] bg-primary-500/20 blur-xl" />
                  <GraduationCap className="relative h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
              </div>
              <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-600 mb-1">65.549</div>
              <div className="text-stone-800 font-semibold text-sm sm:text-base">Mutlu Öğrenci</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="relative w-full max-w-[180px] mx-auto mb-4 sm:mb-5">
                <div className="aspect-square rounded-[2rem] bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center p-6 shadow-lg shadow-primary-500/25">
                  <div className="absolute inset-0 rounded-[2rem] bg-amber-400/20 blur-xl" />
                  <Library className="relative h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
              </div>
              <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-600 mb-1">2.969</div>
              <div className="text-stone-800 font-semibold text-sm sm:text-base">Takip Edilen Konu</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="relative w-full max-w-[180px] mx-auto mb-4 sm:mb-5">
                <div className="aspect-square rounded-[2rem] bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center p-6 shadow-lg shadow-primary-500/25">
                  <div className="absolute inset-0 rounded-[2rem] bg-teal-400/20 blur-xl" />
                  <FileCheck className="relative h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
              </div>
              <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-600 mb-1">11.913</div>
              <div className="text-stone-800 font-semibold text-sm sm:text-base">Çözülen Soru</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="relative w-full max-w-[180px] mx-auto mb-4 sm:mb-5">
                <div className="aspect-square rounded-[2rem] bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center p-6 shadow-lg shadow-primary-500/25">
                  <div className="absolute inset-0 rounded-[2rem] bg-amber-400/20 blur-xl" />
                  <ClipboardCheck className="relative h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
              </div>
              <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-600 mb-1">1.213</div>
              <div className="text-stone-800 font-semibold text-sm sm:text-base">Tamamlanan Deneme</div>
            </div>
          </div>
        </div>
      </section>

      {/* Desteklenen Sınavlar */}
      <section className="py-12 sm:py-16 bg-stone-50 border-y border-stone-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
              Desteklenen Sınavlar
            </h2>
            <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto">
              KPSS, öğretmenlik, lisansüstü ve yabancı dil sınavları dahil tüm yapıyı kendiniz tanımlayıp takip edebilirsiniz.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {['KPSS', 'ÖABT', 'ALES', 'DGS', 'YDS', 'YÖKDİL', 'TUS', 'DUS', 'Diğer'].map((exam) => (
              <span
                key={exam}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 font-semibold text-sm shadow-sm hover:border-primary-200 hover:bg-primary-50/50 transition-colors"
              >
                <Award className="h-4 w-4 text-primary-600" />
                {exam}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-3 sm:mb-4">
              Neden The Goal Lab?
            </h2>
            <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto">
              Modern araçlarla sınav hazırlığınızı bir üst seviyeye taşıyın
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
            <div className="group relative p-6 sm:p-8 bg-white rounded-3xl border border-stone-100 hover:border-primary-100 hover:shadow-soft-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-5 sm:mb-6 shadow-lg shadow-primary-500/25 text-white">
                  <Target className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900 mb-2 sm:mb-3">Hedefli Takip</h3>
                <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                  Her konuyu detaylı takip edin. Tamamlanan, devam eden ve henüz başlanmamış konuları bir bakışta görün.
                </p>
              </div>
            </div>
            <div className="group relative p-6 sm:p-8 bg-white rounded-3xl border border-stone-100 hover:border-primary-100 hover:shadow-soft-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl mb-5 sm:mb-6 shadow-lg shadow-amber-500/25 text-white">
                  <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900 mb-2 sm:mb-3">Görsel İstatistikler</h3>
                <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                  İlerlemenizi grafikler ve istatistiklerle görselleştirin. Hangi konularda ne kadar ilerleme kaydettiğinizi anında görün.
                </p>
              </div>
            </div>
            <div className="group relative p-6 sm:p-8 bg-white rounded-3xl border border-stone-100 hover:border-primary-100 hover:shadow-soft-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-amber-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-600 to-teal-500 rounded-2xl mb-5 sm:mb-6 shadow-lg shadow-primary-500/25 text-white">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900 mb-2 sm:mb-3">Ekip Yönetimi</h3>
                <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                  Kurumlar için özel yönetim paneli. Tüm ekibinizin ilerlemesini merkezi olarak takip edin ve raporlayın.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır? */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white border-y border-stone-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-3 sm:mb-4">
              Nasıl Çalışır?
            </h2>
            <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto">
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
                <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 mb-4">
                  <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <div className="absolute -top-1 -right-1 flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-white text-sm font-bold">
                  {step}
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-stone-900 mb-2">{title}</h3>
                <p className="text-stone-600 text-sm sm:text-base max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              Hemen başla
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white border-y border-stone-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-4 sm:mb-6">
                Her detayı kontrol edin
              </h2>
              <p className="text-lg sm:text-xl text-stone-600 mb-6 sm:mb-8 leading-relaxed">
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
                      <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-primary-500 rounded-lg text-white">
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
              <div className="relative bg-stone-50 rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-soft-lg">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between p-4 sm:p-6 bg-white rounded-2xl border border-primary-100">
                    <div>
                      <p className="font-display font-bold text-stone-900 text-base sm:text-lg mb-0.5">Aktif Sınavlar</p>
                      <p className="text-xs sm:text-sm text-stone-500">Şu anda devam eden</p>
                    </div>
                    <span className="font-display text-3xl sm:text-4xl font-extrabold text-primary-600">12</span>
                  </div>
                  <div className="flex items-center justify-between p-4 sm:p-6 bg-white rounded-2xl border border-amber-100">
                    <div>
                      <p className="font-display font-bold text-stone-900 text-base sm:text-lg mb-0.5">Tamamlanan Konular</p>
                      <p className="text-xs sm:text-sm text-stone-500">Bu ay içinde</p>
                    </div>
                    <span className="font-display text-3xl sm:text-4xl font-extrabold text-amber-600">247</span>
                  </div>
                  <div className="flex items-center justify-between p-4 sm:p-6 bg-white rounded-2xl border border-primary-100">
                    <div>
                      <p className="font-display font-bold text-stone-900 text-base sm:text-lg mb-0.5">Genel İlerleme</p>
                      <p className="text-xs sm:text-sm text-stone-500">Tüm sınavlar için</p>
                    </div>
                    <span className="font-display text-3xl sm:text-4xl font-extrabold text-primary-600">84%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kullanıcı Yorumları */}
      <section className="py-16 sm:py-24 lg:py-32 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-3 sm:mb-4">
              Kullanıcılarımız Ne Diyor?
            </h2>
            <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto">
              Binlerce öğrenci ve kurum sınav takibini The Goal Lab ile yapıyor
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { quote: 'Konuları tek tek işaretleyebilmek ve haftalık hedefi görmek motivasyonumu artırıyor. KPSS için tam aradığım şeydi.', name: 'Ayşe K.', role: 'KPSS adayı' },
              { quote: 'ÖABT ders yapısını kendim girdim, tüm branşları takip ediyorum. Çok pratik.', name: 'Mehmet T.', role: 'Öğretmen adayı' },
              { quote: 'Kurum olarak deneme ve konu takibini tek platformda topladık. Raporlama da çok işimize yarıyor.', name: 'Eğitim Koordinatörü', role: 'Özel dersane' },
            ].map(({ quote, name, role }, i) => (
              <div key={i} className="p-6 sm:p-8 bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-soft transition-shadow">
                <MessageCircle className="h-8 w-8 text-primary-500/70 mb-4" />
                <p className="text-stone-700 leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
                <div>
                  <span className="font-semibold text-stone-900">{name}</span>
                  <span className="text-stone-500 text-sm"> — {role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 sm:py-24 lg:py-32 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-3 sm:mb-4">
              Birlikte Çalıştığımız Kurumlar
            </h2>
            <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto">
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
                className="group p-6 sm:p-8 bg-white rounded-2xl border border-stone-200 hover:border-primary-200 hover:shadow-soft transition-all duration-300"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white font-display font-bold text-sm sm:text-lg shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
                    {institution.initials}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-stone-600 group-hover:text-stone-900 transition-colors">
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

      {/* SSS (kısa özet + link) */}
      <section className="py-12 sm:py-16 bg-white border-y border-stone-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              Merak ettiklerinizin yanıtları
            </p>
          </div>
          <div className="space-y-4 mb-8">
            {[
              { q: 'The Goal Lab ücretsiz mi?', a: 'Evet. Ücretsiz plan ile kayıt olup sınav ve konu takibinizi yapabilirsiniz.' },
              { q: 'Hangi sınavları destekliyorsunuz?', a: 'KPSS, ÖABT, ALES, DGS, YDS ve daha fazlası. Sınav yapısını siz tanımlayabilir veya hazır şablonlardan seçebilirsiniz.' },
            ].map(({ q, a }, i) => (
              <div key={i} className="p-4 sm:p-5 rounded-xl bg-stone-50 border border-stone-100">
                <div className="flex gap-3">
                  <HelpCircle className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-stone-900 mb-1">{q}</h3>
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed">{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center">
            <Link href="/sss" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors inline-flex items-center gap-1">
              Tüm sorular
              <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-primary-600 via-primary-500 to-teal-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.06] bg-[size:24px_24px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-4 sm:mb-6">
              Hemen Başlayın
            </h2>
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-primary-100 mb-10 sm:mb-12 leading-relaxed">
              Ücretsiz hesap oluşturun ve sınav takibinize bugün başlayın. Kredi kartı gerektirmez, sadece 30 saniye sürer.
            </p>
            <Link
              href="/onboarding"
              className="group inline-flex items-center justify-center px-6 py-3.5 sm:px-8 sm:py-4 text-base sm:text-lg font-bold text-primary-600 bg-white rounded-2xl hover:bg-stone-50 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
            >
              Ücretsiz Hesap Oluştur
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-500 text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="font-display text-lg sm:text-xl font-bold text-stone-900">The Goal Lab</span>
              </Link>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                <Link href="/sss" className="text-sm font-medium text-stone-600 hover:text-primary-600 transition-colors">
                  Sıkça Sorulan Sorular
                </Link>
                <Link href="/auth/login" className="text-sm font-medium text-stone-600 hover:text-primary-600 transition-colors hidden sm:block">
                  Giriş Yap
                </Link>
                <Link href="/onboarding" className="text-sm font-medium text-stone-600 hover:text-primary-600 transition-colors hidden sm:block">
                  Başla
                </Link>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100">
              <p className="text-stone-600 text-sm sm:text-base order-last sm:order-first">
                © {new Date().getFullYear()} The Goal Lab. Tüm hakları saklıdır.
              </p>
              <div className="flex items-center gap-2">
                {[
                  { href: 'https://x.com', icon: ({ className }: { className?: string }) => <span className={`inline-flex items-center justify-center text-sm font-bold ${className ?? ''}`}>𝕏</span>, label: 'X' },
                  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
                  { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
                  { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
                  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
                ].map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-stone-100 text-stone-600 hover:bg-primary-100 hover:text-primary-600 transition-colors"
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
    </div>
  );
}
