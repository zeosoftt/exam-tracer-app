/**
 * Rehber / blog SEO sayfaları — /rehber/[slug]
 */

export type GuideSeoEntry = {
  id: string;
  title: string;
  headline: string;
  description: string;
  pageTitle: string;
  pageDescription: string;
  highlights: readonly string[];
};

export const GUIDE_SEO_ENTRIES: GuideSeoEntry[] = [
  {
    id: 'kpss-konu-takibi',
    title: 'KPSS konu takibi',
    headline: 'KPSS konu takibine nasıl başlanır?',
    description:
      'KPSS hazırlığında ders ve konu ağacını oluşturun, tamamlanan konuları işaretleyin ve dashboard’da ilerleme yüzdesini takip edin. Haftalık hedeflerle motivasyonunuzu koruyun.',
    pageTitle: 'KPSS Konu Takibi Rehberi — Adım Adım Başlangıç',
    pageDescription:
      'KPSS konu takibi nasıl yapılır? Ders–konu yapısı, ilerleme yüzdesi ve haftalık hedefler — The Goal Lab ile ücretsiz başlayın.',
    highlights: [
      'KPSS sınav yapısını seçin veya özelleştirin',
      'Konuları tamamlandı / devam ediyor / başlanmadı olarak işaretleyin',
      'Dashboard’da tamamlanma yüzdesi ve haftalık hedef çubukları',
      'Aralıklı tekrar ile unutulan konuları planlayın',
    ],
  },
  {
    id: 'pegem-sonuc-linki',
    title: 'Kurum sonuç linki',
    headline: 'Pegem ve Benim Hocam sonuç linki ile deneme ekleme',
    description:
      'Kurumunuzun yayınladığı sonuç sayfası linkini yapıştırarak ders netlerini otomatik okuyup deneme kaydı oluşturabilirsiniz. Manuel girişe gerek kalmadan netlerinizi tek listede toplayın.',
    pageTitle: 'Kurum Sonuç Linki ile Deneme Ekleme Rehberi',
    pageDescription:
      'Pegem, Benim Hocam ve benzeri kurum sonuç linklerinden deneme netlerini The Goal Lab’e aktarma rehberi.',
    highlights: [
      'Sonuç sayfası URL’sini deneme ekleme formuna yapıştırın',
      'Ders bazlı doğru/yanlış/boş ve net otomatik okunur',
      'Liste görünümünde tüm denemelerinizi karşılaştırın',
      'Pro planda detay, analiz ve ÖSYM uyumlu puan önizlemesi',
    ],
  },
  {
    id: 'deneme-net-takibi',
    title: 'Deneme net takibi',
    headline: 'Excel yerine deneme netlerini takip etmek',
    description:
      'Dağınık Excel veya defter notları yerine deneme netlerinizi tek panelde saklayın. Ortalama net, en yüksek/düşük değerler ve net trendi otomatik hesaplanır.',
    pageTitle: 'Deneme Net Takibi Rehberi — Excel Alternatifi',
    pageDescription:
      'Deneme netlerinizi manuel veya kurum linki ile kaydedin; trend grafiği ve analiz ile gelişiminizi ölçün.',
    highlights: [
      'Manuel deneme girişi veya kurum linki ile hızlı kayıt',
      'Deneme listesi ücretsiz planda kullanılabilir',
      'Pro ile ders/konu analizi ve ÖSYM uyumlu puan',
      'Net trendi ile haftalık gelişimi görün',
    ],
  },
] as const;

export function getGuideSeoSlugs(): string[] {
  return GUIDE_SEO_ENTRIES.map((g) => g.id);
}

export function getGuideSeoEntry(slug: string): GuideSeoEntry | undefined {
  return GUIDE_SEO_ENTRIES.find((g) => g.id === slug);
}
