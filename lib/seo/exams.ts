/**
 * Sınav odaklı SEO içeriği — ana sayfa, /sinavlar, /sinavlar/[slug] ve schema için ortak kaynak.
 */

export type ExamSeoEntry = {
  id: string;
  name: string;
  headline: string;
  description: string;
  pageTitle: string;
  pageDescription: string;
  highlights: readonly string[];
};

export const EXAM_SEO_ENTRIES: ExamSeoEntry[] = [
  {
    id: 'kpss',
    name: 'KPSS',
    headline: 'KPSS konu takibi ve deneme analizi',
    description:
      'Genel yetenek, genel kültür ve alan bilgisi konularını işaretleyin. Deneme netlerinizi kaydedin; ÖSYM uyumlu KPSS puan önizlemesi ile hedef puanınıza ne kadar kaldığını görün.',
    pageTitle: 'KPSS Konu Takibi ve Deneme Analizi',
    pageDescription:
      'KPSS genel yetenek, genel kültür ve alan konularını takip edin. Deneme net kaydı, net trendi ve ÖSYM uyumlu puan önizlemesi — The Goal Lab ile ücretsiz başlayın.',
    highlights: [
      'Genel yetenek ve genel kültür konu ağacı',
      'Alan bilgisi derslerinde konu tamamlama yüzdesi',
      'Deneme kaydı ve ortalama net grafiği',
      'Hedef puan ve ÖSYM uyumlu puan önizlemesi (Pro)',
    ],
  },
  {
    id: 'oabt',
    name: 'ÖABT',
    headline: 'ÖABT öğretmenlik alan sınavı takibi',
    description:
      'Branşınıza göre ders ve konu ağacını kurun. Konu tamamlama yüzdesi ve deneme sonuçlarıyla ÖABT hazırlığınızı düzenli takip edin.',
    pageTitle: 'ÖABT Konu Takibi — Öğretmenlik Alan Sınavı Hazırlığı',
    pageDescription:
      'ÖABT branş konularını takip edin, deneme netlerinizi kaydedin ve ilerlemenizi dashboard’da görün. The Goal Lab ile ücretsiz başlayın.',
    highlights: [
      'Branşa özel ders ve konu yapısı',
      'Konu tamamlama ve haftalık hedef takibi',
      'Deneme sonuçları ve net trendi',
      'Aralıklı tekrar ile unutulan konuları planlama',
    ],
  },
  {
    id: 'ales',
    name: 'ALES',
    headline: 'ALES sayısal ve sözel konu takibi',
    description:
      'Sayısal ve sözel bölüm konularını ayrı ayrı izleyin. Deneme kayıtları ve net trendi ile ALES hazırlık sürecinizi ölçülebilir hale getirin.',
    pageTitle: 'ALES Konu Takibi ve Deneme Net Analizi',
    pageDescription:
      'ALES sayısal ve sözel konu ilerlemesi, deneme kaydı ve net grafiği. Akademik personel ve lisansüstü adayları için — The Goal Lab.',
    highlights: [
      'Sayısal ve sözel bölüm ayrı takip',
      'Konu bazlı tamamlanma yüzdesi',
      'Deneme ortalaması ve en yüksek/düşük net',
      'Haftalık çalışma hedefleri',
    ],
  },
  {
    id: 'yks',
    name: 'YKS',
    headline: 'YKS TYT ve AYT konu takibi',
    description:
      'TYT ve AYT derslerini tek hesapta yönetin. Konu ilerlemesi, deneme analizi ve hedef üniversite puanına göre plan yapın.',
    pageTitle: 'YKS Konu Takibi — TYT ve AYT Hazırlık Programı',
    pageDescription:
      'YKS TYT ve AYT konu takibi, deneme analizi ve hedef puan planlaması. Üniversite sınavına hazırlananlar için The Goal Lab.',
    highlights: [
      'TYT ve AYT dersleri tek panelde',
      'Konu tamamlama ve deneme net trendi',
      'Hedef üniversite puanına göre plan',
      'Pomodoro ile odaklı çalışma takibi',
    ],
  },
  {
    id: 'dgs',
    name: 'DGS',
    headline: 'DGS dikey geçiş sınavı hazırlığı',
    description:
      'DGS sayısal ve Türkçe konularını takip edin. Deneme sonuçlarınızı saklayarak zaman içindeki gelişiminizi karşılaştırın.',
    pageTitle: 'DGS Konu Takibi ve Deneme Kaydı',
    pageDescription:
      'DGS sayısal ve Türkçe konu takibi, deneme net analizi ve ilerleme dashboard’u. Dikey geçiş adayları için The Goal Lab.',
    highlights: [
      'Sayısal ve Türkçe konu ağacı',
      'Deneme kayıtları ve net karşılaştırma',
      'Konu tamamlama özeti',
      'Ücretsiz başlangıç, kredi kartı gerekmez',
    ],
  },
  {
    id: 'yds',
    name: 'YDS',
    headline: 'YDS ve yabancı dil sınav takibi',
    description:
      'Kelime, gramer ve deneme odaklı çalışma planınızı konu bazında işaretleyin; ilerlemenizi haftalık hedeflerle destekleyin.',
    pageTitle: 'YDS Konu Takibi — Yabancı Dil Sınav Hazırlığı',
    pageDescription:
      'YDS kelime, gramer ve deneme odaklı konu takibi. Yabancı dil sınavına hazırlananlar için The Goal Lab ile ücretsiz başlayın.',
    highlights: [
      'Kelime ve gramer konu grupları',
      'Deneme odaklı ilerleme takibi',
      'Haftalık hedef ve dashboard özeti',
      'Mobil uyumlu çalışma arayüzü',
    ],
  },
];

export const EXAM_NAMES_SHORT = EXAM_SEO_ENTRIES.map((e) => e.name);

export const EXAM_SEO_PAGE_TITLE = 'Desteklenen Sınavlar — KPSS, ALES, ÖABT, YKS, DGS';

export const EXAM_SEO_PAGE_DESCRIPTION =
  'KPSS, ÖABT, ALES, YKS (TYT/AYT), DGS ve YDS için konu takibi, deneme kaydı ve ÖSYM uyumlu puan hesaplama. The Goal Lab ile ücretsiz başlayın.';

export function getExamSeoEntry(slug: string): ExamSeoEntry | undefined {
  return EXAM_SEO_ENTRIES.find((entry) => entry.id === slug);
}

export function getExamSeoSlugs(): string[] {
  return EXAM_SEO_ENTRIES.map((entry) => entry.id);
}
