/**
 * Landing Page
 * Modern, Codecademy-inspired landing page with contemporary design
 */

import Link from 'next/link';
import { BookOpen, Users, TrendingUp, Shield, ArrowRight, CheckCircle, Zap, Target, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition"></div>
                <BookOpen className="relative h-8 w-8 text-blue-600" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Exam Tracker
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors hidden sm:block"
              >
                Giriş Yap
              </Link>
              <Link
                href="/onboarding"
                className="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 hover:scale-105"
              >
                Başla
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
        <div className="absolute inset-0 bg-grid-gray-900/[0.04] bg-[size:20px_20px]"></div>
        
        <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm font-medium text-gray-700 mb-8 shadow-sm">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Sınav takibiniz artık çok daha kolay</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight mb-6">
              <span className="block text-gray-900">Sınav Hazırlığınızı</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Profesyonelleştirin
              </span>
            </h1>
            
            <p className="mx-auto max-w-3xl text-xl sm:text-2xl text-gray-600 leading-relaxed mb-12">
              Devlet sınavlarında sorumlu olduğunuz tüm dersleri ve konuları sistematik bir şekilde takip edin. 
              <span className="font-semibold text-gray-900"> 10 milyon+ kullanıcıya</span> hazır altyapı ile.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/onboarding"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl shadow-blue-500/50 hover:shadow-3xl hover:shadow-blue-500/60 hover:scale-105 w-full sm:w-auto"
              >
                Ücretsiz Başla
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-900 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all w-full sm:w-auto"
              >
                Giriş Yap
              </Link>
            </div>

            <p className="mt-8 text-sm text-gray-500">
              Kredi kartı gerektirmez • Kurulum 30 saniye • Hemen kullanmaya başla
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2">10M+</div>
              <div className="text-gray-600 font-medium">Kullanıcı Kapasitesi</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2">%99.9</div>
              <div className="text-gray-600 font-medium">Uptime Garantisi</div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Destek</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              Neden Exam Tracker?
            </h2>
            <p className="text-xl text-gray-600">
              Modern araçlarla sınav hazırlığınızı bir üst seviyeye taşıyın
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="group relative p-8 bg-white rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/30">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Hedefli Takip</h3>
                <p className="text-gray-600 leading-relaxed">
                  Her konuyu detaylı olarak takip edin. Tamamlanan, devam eden ve henüz başlanmamış konuları 
                  bir bakışta görün.
                </p>
              </div>
            </div>

            <div className="group relative p-8 bg-white rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6 shadow-lg shadow-purple-500/30">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Görsel İstatistikler</h3>
                <p className="text-gray-600 leading-relaxed">
                  İlerlemenizi grafikler ve istatistiklerle görselleştirin. Hangi konularda ne kadar 
                  ilerleme kaydettiğinizi anında görün.
                </p>
              </div>
            </div>

            <div className="group relative p-8 bg-white rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-orange-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-pink-500 to-orange-600 rounded-2xl mb-6 shadow-lg shadow-pink-500/30">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Ekip Yönetimi</h3>
                <p className="text-gray-600 leading-relaxed">
                  Kurumlar için özel yönetim paneli. Tüm ekibinizin ilerlemesini merkezi olarak 
                  takip edin ve raporlayın.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 sm:py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
                Her detayı kontrol edin
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Karmaşık sınav yapılarını bile kolayca yönetin. Her sınav için 
                dersleri, her ders için konuları tanımlayın ve ilerlemenizi anlık olarak takip edin.
              </p>
              <ul className="space-y-4">
                {[
                  'Sınırsız sınav, ders ve konu ekleme',
                  'Gerçek zamanlı ilerleme takibi',
                  'Kurumsal rol yönetimi',
                  'Güvenli veri saklama',
                  'Mobil uyumlu arayüz',
                  'Detaylı raporlama araçları',
                ].map((feature, index) => (
                  <li key={feature} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <span className="text-gray-700 text-lg font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl border border-gray-200 p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Aktif Sınavlar</p>
                      <p className="text-sm text-gray-600">Şu anda devam eden</p>
                    </div>
                    <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">12</span>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Tamamlanan Konular</p>
                      <p className="text-sm text-gray-600">Bu ay içinde</p>
                    </div>
                    <span className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">247</span>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-gradient-to-br from-pink-50 to-orange-50 rounded-2xl border border-pink-100">
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Genel İlerleme</p>
                      <p className="text-sm text-gray-600">Tüm sınavlar için</p>
                    </div>
                    <span className="text-4xl font-extrabold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">84%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              Birlikte Çalıştığımız Kurumlar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Türkiye'nin önde gelen kurumları sınav takiplerini Exam Tracker ile yönetiyor
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-center">
            {/* Kurum Logoları - Placeholder tasarım */}
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
                className="group relative p-8 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 mb-4 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white font-bold text-lg shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    {institution.initials}
                  </div>
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                    {institution.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              +100'den fazla kamu kurumu ve özel eğitim kurumu Exam Tracker kullanıyor
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6">
              Hemen Başlayın
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-blue-100 mb-12 leading-relaxed">
              Ücretsiz hesap oluşturun ve sınav takibinize bugün başlayın. 
              Kredi kartı gerektirmez, sadece 30 saniye sürer.
            </p>
            <Link
              href="/onboarding"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-blue-600 bg-white rounded-2xl hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105"
            >
              Ücretsiz Hesap Oluştur
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Exam Tracker</span>
            </Link>
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Exam Tracker. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
