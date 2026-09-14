import type { CurriculumExam } from '../types';
import {
  COGRAFYA_TOPICS,
  DIN_KULTURU_TOPICS,
  FELSEFE_TOPICS,
  GEOMETRI_TOPICS,
  MATEMATIK_TOPICS,
  TARIH_TOPICS,
  TURKCE_TOPICS,
  TYT_BIYOLOJI_TOPICS,
  TYT_FIZIK_TOPICS,
  TYT_KIMYA_TOPICS,
} from '../shared/topics';

export const YKS_TYT_CURRICULUM: CurriculumExam = {
  code: 'YKS_TYT',
  name: 'YKS-TYT (Temel Yeterlilik Testi)',
  description: 'Üniversiteye giriş birinci aşama — Türkçe, Sosyal, Matematik, Fen',
  sections: [
    {
      code: 'TURKCE',
      name: 'Türkçe',
      subjects: [{ code: 'TYT_TURKCE', name: 'Türkçe', topics: TURKCE_TOPICS }],
    },
    {
      code: 'SOSYAL_BILIMLER',
      name: 'Sosyal Bilimler',
      subjects: [
        { code: 'TARIH', name: 'Tarih', topics: TARIH_TOPICS },
        { code: 'COGRAFYA', name: 'Coğrafya', topics: COGRAFYA_TOPICS },
        { code: 'FELSEFE', name: 'Felsefe', topics: FELSEFE_TOPICS },
        { code: 'DIN_KULTURU', name: 'Din Kültürü', topics: DIN_KULTURU_TOPICS },
      ],
    },
    {
      code: 'TEMEL_MATEMATIK',
      name: 'Temel Matematik',
      subjects: [
        { code: 'MATEMATIK', name: 'Matematik', topics: MATEMATIK_TOPICS },
        { code: 'GEOMETRI', name: 'Geometri', topics: GEOMETRI_TOPICS },
      ],
    },
    {
      code: 'FEN_BILIMLERI',
      name: 'Fen Bilimleri',
      subjects: [
        { code: 'FIZIK', name: 'Fizik', topics: TYT_FIZIK_TOPICS },
        { code: 'KIMYA', name: 'Kimya', topics: TYT_KIMYA_TOPICS },
        { code: 'BIYOLOJI', name: 'Biyoloji', topics: TYT_BIYOLOJI_TOPICS },
      ],
    },
  ],
};
