/**
 * Sıkça Sorulan Sorular (SSS) sayfası
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { getBaseUrl } from '@/lib/seo/baseUrl';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const title = 'Sıkça Sorulan Sorular';
  const description = 'The Goal Lab (thegoallab) hakkında sıkça sorulan sorular ve yanıtları. Ücretsiz mi, hangi sınavlar, güvenlik, mobil.';
  return {
    title,
    description,
    openGraph: { url: `${baseUrl}/sss`, title, description },
    alternates: { canonical: `${baseUrl}/sss` },
  };
}

const FAQ_ITEMS = [
  { q: 'The Goal Lab ücretsiz mi?', a: 'Evet. Ücretsiz plan ile kayıt olup sınav ve konu takibinizi yapabilirsiniz. Gelişmiş özellikler ve kurumsal kullanım için ücretli planlar sunulmaktadır.' },
  { q: 'Hangi sınavları destekliyorsunuz?', a: 'KPSS, ÖABT, ALES, DGS, YDS, YÖKDİL, TUS, DUS gibi tüm sınavlar için sınav yapısını siz tanımlayabilir veya hazır şablonlardan seçebilirsiniz. Platform sınavdan bağımsız çalışır.' },
  { q: 'Verilerim güvende mi?', a: 'Evet. Verileriniz şifreli ve güvenli sunucularda saklanır. Kişisel verileriniz üçüncü taraflarla paylaşılmaz.' },
  { q: 'Mobil cihazlardan kullanabilir miyim?', a: 'Evet. The Goal Lab responsive tasarıma sahiptir; telefon ve tabletten tarayıcı üzerinden rahatça kullanabilirsiniz.' },
  { q: 'Hesabımı nasıl oluştururum?', a: 'Ana sayfadaki "Başla" veya "Ücretsiz Başla" butonuna tıklayarak kayıt sayfasına gidebilirsiniz. E-posta ve şifre ile birkaç saniyede hesap oluşturabilirsiniz.' },
  { q: 'Kurumsal kullanım için ne yapmalıyım?', a: 'Kurumlar için özel plan ve yönetim paneli mevcuttur. İletişim veya kayıt sırasında kurumsal seçeneği belirleyebilirsiniz.' },
];

export default function SSSPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <MarketingHeader />

      <main className="mx-auto max-w-3xl px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8 lg:pb-20 lg:pt-28">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Ana sayfaya dön
        </Link>
        <div className="mb-10 sm:mb-12">
          <h1 className="mb-2 font-display text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl">
            Sıkça Sorulan Sorular
          </h1>
          <p className="text-base text-stone-600 dark:text-stone-400 sm:text-lg">Merak ettiklerinizin yanıtları</p>
        </div>
        <div className="space-y-4">
          {FAQ_ITEMS.map(({ q, a }, i) => (
            <div
              key={i}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-soft dark:border-stone-800 dark:bg-stone-900/90 sm:p-5"
            >
              <div className="flex gap-3">
                <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" />
                <div>
                  <h2 className="mb-2 font-display text-lg font-semibold text-stone-900 dark:text-stone-100">{q}</h2>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-400 sm:text-base">{a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">Sorunuz mu var?</p>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3 text-base font-semibold text-white transition-all hover:from-primary-700 hover:to-primary-600"
          >
            Ücretsiz Başla
          </Link>
        </div>
      </main>

      <footer className="mt-12 border-t border-stone-200 bg-white py-6 dark:border-stone-800 dark:bg-stone-900 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              © {new Date().getFullYear()} The Goal Lab. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
