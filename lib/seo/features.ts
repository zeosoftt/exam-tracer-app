/**
 * Özellik odaklı SEO landing sayfaları — /ozellikler/[slug]
 */

export type FeatureSeoEntry = {
  id: string;
  name: string;
  headline: string;
  description: string;
  pageTitle: string;
  pageDescription: string;
  highlights: readonly string[];
};

/** Ana sayfa ve /ozellikler indeksinde ortak özet metin */
export const PRODUCT_FEATURES_SUMMARY =
  'The Goal Lab; konu takibi, deneme analizi, aralıklı tekrar ve odaklı çalışma araçlarını tek platformda sunar. KPSS, ALES, YKS ve diğer sınavlarda ilerlemenizi ölçülebilir hale getirin.';

export const FEATURE_SEO_ENTRIES: FeatureSeoEntry[] = [
  {
    id: 'konu-takibi',
    name: 'Konu takibi',
    headline: 'Sınav konularını adım adım tamamlayın',
    description:
      'Ders ve konu ağacınızı işaretleyin; tamamlanan, devam eden ve başlanmamış konuları tek panelden görün. KPSS, ALES, YKS ve diğer sınavlarda ilerlemenizi yüzde olarak takip edin.',
    pageTitle: 'Konu Takibi — KPSS, ALES, YKS Konu İlerlemesi',
    pageDescription:
      'KPSS, ÖABT, ALES, YKS ve DGS için konu tamamlama takibi. Ders bazlı ilerleme, haftalık hedefler ve dashboard özeti — The Goal Lab ile ücretsiz başlayın.',
    highlights: [
      'Hazır sınav şablonları veya özel ders–konu ağacı',
      'Tamamlanan / devam eden / başlanmamış konu durumları',
      'Dashboard’da sınav bazlı tamamlanma yüzdesi',
      'Konu detayında not ve tekrar planı',
    ],
  },
  {
    id: 'deneme-takibi',
    name: 'Deneme takibi',
    headline: 'Deneme netlerinizi kaydedin ve trendi görün',
    description:
      'Manuel deneme girişi veya kurum sonuç linki ile netlerinizi saklayın. Ortalama net, en yüksek/düşük değerler ve net grafiği ile gelişiminizi ölçün.',
    pageTitle: 'Deneme Takibi ve Net Analizi — KPSS, ALES Deneme Kaydı',
    pageDescription:
      'Deneme net takibi, ortalama net grafiği ve kurum sonuç linki ile otomatik aktarım. KPSS ve ALES hazırlığında deneme analizi — The Goal Lab.',
    highlights: [
      'Toplam deneme, ortalama net ve net aralığı özeti',
      'Son denemeler net grafiği',
      'Kurum sonuç linkinden otomatik veri aktarımı (Pegem vb.)',
      'Deneme listesi ve geçmiş karşılaştırma',
    ],
  },
  {
    id: 'aralikli-tekrar',
    name: 'Aralıklı tekrar',
    headline: 'Unutulan konuları zamanında tekrar edin',
    description:
      'Spaced repetition ile tekrar planınızı otomatik oluşturun. Geciken ve yaklaşan tekrarları dashboard’da görün; konu bazlı hatırlatmalarla çalışmayı sürdürün.',
    pageTitle: 'Aralıklı Tekrar (Spaced Repetition) — Konu Tekrar Planı',
    pageDescription:
      'Sınav hazırlığında aralıklı tekrar planı: geciken konular, 7 gün içindeki tekrarlar ve konu bazlı SRS takibi. The Goal Lab dashboard.',
    highlights: [
      'Konu tamamlandığında otomatik tekrar aralıkları',
      'Geciken ve yaklaşan tekrar özeti',
      'Dashboard’da 7 günlük tekrar listesi',
      'Konu detayından tekrar onaylama',
    ],
  },
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    headline: 'Odaklı çalışma seansları ile süreyi ölçün',
    description:
      'Pomodoro zamanlayıcı ile çalışma bloklarınızı kaydedin. Günlük ve haftalık odak süresini takip ederek planınıza ne kadar sadık kaldığınızı görün.',
    pageTitle: 'Pomodoro Zamanlayıcı — Sınav Hazırlığı Odak Takibi',
    pageDescription:
      'Sınav hazırlığı için Pomodoro zamanlayıcı ve çalışma süresi takibi. Odak seanslarını kaydedin — The Goal Lab.',
    highlights: [
      '25/5 veya özelleştirilebilir Pomodoro döngüsü',
      'Tamamlanan seans geçmişi',
      'Dashboard ile birlikte çalışma disiplini',
      'Mobil uyumlu zamanlayıcı arayüzü',
    ],
  },
];

export function getFeatureSeoEntry(slug: string): FeatureSeoEntry | undefined {
  return FEATURE_SEO_ENTRIES.find((entry) => entry.id === slug);
}

export function getFeatureSeoSlugs(): string[] {
  return FEATURE_SEO_ENTRIES.map((entry) => entry.id);
}
