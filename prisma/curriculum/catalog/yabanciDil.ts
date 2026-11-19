/**
 * Yabancı dil sınavları — e-YDS, YÖKDİL (YKS-YDT bu listeleri kullanır).
 */

import { exam, sec, sub, type CatalogTopicInput } from './dsl';

/** ÖSYM yabancı dil sınavlarındaki soru tipleri (e-YDS / YDT / YÖKDİL ortak). */
export const YDS_QUESTION_TYPE_TOPICS: CatalogTopicInput[] = [
  ['KELIME_BILGISI', 'Kelime Bilgisi (Vocabulary)'],
  ['DIL_BILGISI', 'Dil Bilgisi (Grammar)'],
  'Cloze Test',
  'Cümle Tamamlama',
  'İngilizce - Türkçe Çeviri',
  'Türkçe - İngilizce Çeviri',
  'Okuma Parçası (Reading Comprehension)',
  'Diyalog Tamamlama',
  'Anlamca En Yakın Cümle',
  'Paragraf Tamamlama',
  'Anlam Bütünlüğünü Bozan Cümle',
];

/** Sınavlarda en sık sorulan dil bilgisi başlıkları. */
export const YDS_GRAMMAR_TOPICS: CatalogTopicInput[] = [
  'Tenses (Zamanlar)',
  'Modals (Kipler)',
  'Passive Voice (Edilgen Yapı)',
  'If Clauses ve Wish Clauses',
  'Relative Clauses (Sıfat Cümlecikleri)',
  'Noun Clauses (İsim Cümlecikleri)',
  'Adverbial Clauses ve Bağlaçlar',
  'Gerunds ve Infinitives',
  'Prepositions (Edatlar)',
  'Quantifiers, Determiners ve Pronouns',
  'Adjectives, Adverbs ve Karşılaştırmalar',
  'Reported Speech (Dolaylı Anlatım)',
  'Causatives ve Inversion',
];

export const E_YDS = exam(
  'E_YDS',
  'e-YDS (Elektronik Yabancı Dil Bilgisi Seviye Tespit Sınavı)',
  'Kamu ve akademik yabancı dil yeterlilik sınavı — İngilizce',
  [
    sec('INGILIZCE', 'İngilizce', [
      sub('E_YDS_ENG', 'Soru Tipleri', YDS_QUESTION_TYPE_TOPICS),
      sub('E_YDS_GRAMER', 'Dil Bilgisi Konuları', YDS_GRAMMAR_TOPICS),
    ]),
  ],
);

/**
 * YÖKDİL: aday tek bir alana girer. Ortak soru tipleri ve gramer tek bölümde,
 * alanlara özgü akademik kelime çalışması küçük alan bölümlerinde tutulur
 * (ilerleme yüzdesi diğer alanların uzun listeleriyle şişmesin).
 */
export const YOKDIL = exam(
  'YOKDIL',
  'YÖKDİL',
  'Yükseköğretim Kurumları Yabancı Dil Sınavı — Sağlık, Sosyal ve Fen Bilimleri alanları',
  [
    sec('INGILIZCE', 'İngilizce (Ortak)', [
      sub('YOKDIL_ENG', 'Soru Tipleri', YDS_QUESTION_TYPE_TOPICS),
      sub('YOKDIL_GRAMER', 'Dil Bilgisi Konuları', YDS_GRAMMAR_TOPICS),
    ]),
    sec('SAGLIK_BILIMLERI', 'Sağlık Bilimleri', [
      sub('YOKDIL_SB', 'Sağlık Bilimleri Alan Okumaları', [
        ['TIP_TERIMLERI', 'Tıbbi Terimler'],
        'Anatomi ve Fizyoloji Metinleri',
        'Hastalıklar ve Tedavi Metinleri',
        'Halk Sağlığı ve Araştırma Metinleri',
      ]),
    ]),
    sec('SOSYAL_BILIMLER', 'Sosyal Bilimler', [
      sub('YOKDIL_SOS', 'Sosyal Bilimler Alan Okumaları', [
        'Sosyal Bilimler Akademik Kelimeleri',
        'Tarih ve Kültür Metinleri',
        'Ekonomi ve Siyaset Metinleri',
        'Psikoloji ve Eğitim Metinleri',
      ]),
    ]),
    sec('FEN_BILIMLERI', 'Fen Bilimleri', [
      sub('YOKDIL_FEN', 'Fen Bilimleri Alan Okumaları', [
        'Fen Bilimleri Akademik Kelimeleri',
        'Fizik ve Kimya Metinleri',
        'Biyoloji ve Çevre Metinleri',
        'Mühendislik ve Teknoloji Metinleri',
      ]),
    ]),
  ],
);
