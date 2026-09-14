import type { CurriculumExam } from '../types';
import {
  GEOMETRI_TOPICS,
  MATEMATIK_TOPICS,
  TURKCE_TOPICS,
} from '../shared/topics';

export const ALES_CURRICULUM: CurriculumExam = {
  code: 'ALES',
  name: 'ALES (Akademik Personel ve Lisansüstü Eğitimi Giriş Sınavı)',
  description: 'Yüksek lisans ve doktora başvuruları için sayısal ve sözel testler',
  sections: [
    {
      code: 'SAYISAL',
      name: 'Sayısal',
      subjects: [
        { code: 'MATEMATIK', name: 'Matematik', topics: MATEMATIK_TOPICS },
        { code: 'GEOMETRI', name: 'Geometri', topics: GEOMETRI_TOPICS },
      ],
    },
    {
      code: 'SOZEL',
      name: 'Sözel',
      subjects: [{ code: 'TURKCE', name: 'Türkçe', topics: TURKCE_TOPICS }],
    },
  ],
};
