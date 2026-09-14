import type { CurriculumExam } from '../types';
import {
  AYT_BIYOLOJI_TOPICS,
  AYT_COGRAFYA1_TOPICS,
  AYT_EDEBIYAT_TOPICS,
  AYT_FIZIK_TOPICS,
  AYT_KIMYA_TOPICS,
  AYT_MATEMATIK_TOPICS,
  AYT_TARIH1_TOPICS,
  FELSEFE_TOPICS,
} from '../shared/topics';

export const YKS_AYT_CURRICULUM: CurriculumExam = {
  code: 'YKS_AYT',
  name: 'YKS-AYT (Alan Yeterlilik Testi)',
  description: 'Üniversiteye giriş ikinci aşama — Sayısal, Eşit Ağırlık, Sözel ve Dil alanları',
  sections: [
    {
      code: 'MATEMATIK',
      name: 'Matematik',
      subjects: [{ code: 'AYT_MATEMATIK', name: 'Matematik', topics: AYT_MATEMATIK_TOPICS }],
    },
    {
      code: 'FEN_BILIMLERI',
      name: 'Fen Bilimleri',
      subjects: [
        { code: 'FIZIK', name: 'Fizik', topics: AYT_FIZIK_TOPICS },
        { code: 'KIMYA', name: 'Kimya', topics: AYT_KIMYA_TOPICS },
        { code: 'BIYOLOJI', name: 'Biyoloji', topics: AYT_BIYOLOJI_TOPICS },
      ],
    },
    {
      code: 'TURKCE',
      name: 'Türk Dili ve Edebiyatı',
      subjects: [{ code: 'EDEBIYAT', name: 'Edebiyat', topics: AYT_EDEBIYAT_TOPICS }],
    },
    {
      code: 'SOSYAL_BILIMLER',
      name: 'Sosyal Bilimler',
      subjects: [
        { code: 'TARIH', name: 'Tarih-1', topics: AYT_TARIH1_TOPICS },
        { code: 'COGRAFYA', name: 'Coğrafya-1', topics: AYT_COGRAFYA1_TOPICS },
        { code: 'FELSEFE_GRUBU', name: 'Felsefe Grubu', topics: FELSEFE_TOPICS },
      ],
    },
  ],
};
