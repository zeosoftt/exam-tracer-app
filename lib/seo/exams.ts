/**
 * Sınav odaklı SEO içeriği — ana sayfa, /sinavlar ve schema için ortak kaynak.
 */

export type ExamSeoEntry = {
  id: string;
  name: string;
  headline: string;
  description: string;
};

export const EXAM_SEO_ENTRIES: ExamSeoEntry[] = [
  {
    id: 'kpss',
    name: 'KPSS',
    headline: 'KPSS konu takibi ve deneme analizi',
    description:
      'Genel yetenek, genel kültür ve alan bilgisi konularını işaretleyin. Deneme netlerinizi kaydedin; ÖSYM uyumlu KPSS puan önizlemesi ile hedef puanınıza ne kadar kaldığını görün.',
  },
  {
    id: 'oabt',
    name: 'ÖABT',
    headline: 'ÖABT öğretmenlik alan sınavı takibi',
    description:
      'Branşınıza göre ders ve konu ağacını kurun. Konu tamamlama yüzdesi ve deneme sonuçlarıyla ÖABT hazırlığınızı düzenli takip edin.',
  },
  {
    id: 'ales',
    name: 'ALES',
    headline: 'ALES sayısal ve sözel konu takibi',
    description:
      'Sayısal ve sözel bölüm konularını ayrı ayrı izleyin. Deneme kayıtları ve net trendi ile ALES hazırlık sürecinizi ölçülebilir hale getirin.',
  },
  {
    id: 'yks',
    name: 'YKS',
    headline: 'YKS TYT ve AYT konu takibi',
    description:
      'TYT ve AYT derslerini tek hesapta yönetin. Konu ilerlemesi, deneme analizi ve hedef üniversite puanına göre plan yapın.',
  },
  {
    id: 'dgs',
    name: 'DGS',
    headline: 'DGS dikey geçiş sınavı hazırlığı',
    description:
      'DGS sayısal ve Türkçe konularını takip edin. Deneme sonuçlarınızı saklayarak zaman içindeki gelişiminizi karşılaştırın.',
  },
  {
    id: 'yds',
    name: 'YDS',
    headline: 'YDS ve yabancı dil sınav takibi',
    description:
      'Kelime, gramer ve deneme odaklı çalışma planınızı konu bazında işaretleyin; ilerlemenizi haftalık hedeflerle destekleyin.',
  },
];

export const EXAM_NAMES_SHORT = EXAM_SEO_ENTRIES.map((e) => e.name);

export const EXAM_SEO_PAGE_TITLE = 'Desteklenen Sınavlar — KPSS, ALES, ÖABT, YKS, DGS';

export const EXAM_SEO_PAGE_DESCRIPTION =
  'KPSS, ÖABT, ALES, YKS (TYT/AYT), DGS ve YDS için konu takibi, deneme kaydı ve ÖSYM uyumlu puan hesaplama. The Goal Lab ile ücretsiz başlayın.';
