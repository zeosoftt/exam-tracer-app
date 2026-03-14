/**
 * Sıkça Sorulan Sorular (SSS) sayfası
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, HelpCircle, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular | Exam Tracker',
  description: 'Exam Tracker hakkında sıkça sorulan sorular ve yanıtları.',
};

const FAQ_ITEMS = [
  { q: 'Exam Tracker ücretsiz mi?', a: 'Evet. Ücretsiz plan ile kayıt olup sınav ve konu takibinizi yapabilirsiniz. Gelişmiş özellikler ve kurumsal kullanım için ücretli planlar sunulmaktadır.' },
  { q: 'Hangi sınavları destekliyorsunuz?', a: 'KPSS, ÖABT, ALES, DGS, YDS, YÖKDİL, TUS, DUS gibi tüm sınavlar için sınav yapısını siz tanımlayabilir veya hazır şablonlardan seçebilirsiniz. Platform sınavdan bağımsız çalışır.' },
  { q: 'Verilerim güvende mi?', a: 'Evet. Verileriniz şifreli ve güvenli sunucularda saklanır. Kişisel verileriniz üçüncü taraflarla paylaşılmaz.' },
  { q: 'Mobil cihazlardan kullanabilir miyim?', a: 'Evet. Exam Tracker responsive tasarıma sahiptir; telefon ve tabletten tarayıcı üzerinden rahatça kullanabilirsiniz.' },
  { q: 'Hesabımı nasıl oluştururum?', a: 'Ana sayfadaki "Başla" veya "Ücretsiz Başla" butonuna tıklayarak kayıt sayfasına gidebilirsiniz. E-posta ve şifre ile birkaç saniyede hesap oluşturabilirsiniz.' },
  { q: 'Kurumsal kullanım için ne yapmalıyım?', a: 'Kurumlar için özel plan ve yönetim paneli mevcuttur. İletişim veya kayıt sırasında kurumsal seçeneği belirleyebilirsiniz.' },
];

export default function SSSPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="font-display text-xl sm:text-2xl font-bold text-stone-900">Exam Tracker</span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-6">
              <Link href="/auth/login" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors hidden sm:block">
                Giriş Yap
              </Link>
              <Link href="/onboarding" className="inline-flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/25">
                Başla
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Ana sayfaya dön
        </Link>
        <div className="mb-10 sm:mb-12">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-2">
            Sıkça Sorulan Sorular
          </h1>
          <p className="text-stone-600 text-base sm:text-lg">
            Merak ettiklerinizin yanıtları
          </p>
        </div>
        <div className="space-y-4">
          {FAQ_ITEMS.map(({ q, a }, i) => (
            <div key={i} className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-100 shadow-sm hover:shadow-soft transition-shadow">
              <div className="flex gap-3">
                <HelpCircle className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-display font-semibold text-stone-900 mb-2 text-lg">{q}</h2>
                  <p className="text-stone-600 text-sm sm:text-base leading-relaxed">{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-stone-500 text-sm mb-4">Sorunuz mu var?</p>
          <Link href="/onboarding" className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all">
            Ücretsiz Başla
          </Link>
        </div>
      </main>

      <footer className="border-t border-stone-200 bg-white py-6 sm:py-8 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-500 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold text-stone-900">Exam Tracker</span>
            </Link>
            <p className="text-stone-600 text-sm">
              © {new Date().getFullYear()} Exam Tracker. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
