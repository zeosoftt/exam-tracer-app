import type { CurriculumExam } from '../types';
import { MATEMATIK_TOPICS, TURKCE_TOPICS } from '../shared/topics';

export const DGS_CURRICULUM: CurriculumExam = {
  code: 'DGS',
  name: 'DGS (Dikey Geçiş Sınavı)',
  description: 'Önlisans mezunlarının lisans tamamlaması için sayısal ve sözel yetenek testleri',
  sections: [
    {
      code: 'SAYISAL_YETENEK',
      name: 'Sayısal Yetenek',
      subjects: [{ code: 'MATEMATIK', name: 'Matematik', topics: MATEMATIK_TOPICS }],
    },
    {
      code: 'SOZEL_YETENEK',
      name: 'Sözel Yetenek',
      subjects: [{ code: 'TURKCE', name: 'Türkçe', topics: TURKCE_TOPICS }],
    },
  ],
};
