import type { CurriculumExam } from '../types';
import { INGILIZCE_YDS_TOPICS, yokdilFieldTopics } from '../shared/topics';

export const YKS_YDT_CURRICULUM: CurriculumExam = {
  code: 'YKS_YDT',
  name: 'YKS-YDT (Yabancı Dil Testi)',
  description: 'Yabancı dil puanı ile tercih yapacak adaylar için İngilizce test',
  sections: [
    {
      code: 'INGILIZCE',
      name: 'İngilizce',
      subjects: [{ code: 'YDT_INGILIZCE', name: 'İngilizce', topics: INGILIZCE_YDS_TOPICS }],
    },
  ],
};

export const E_YDS_CURRICULUM: CurriculumExam = {
  code: 'E_YDS',
  name: 'e-YDS (Elektronik Yabancı Dil Bilgisi Seviye Tespit Sınavı)',
  description: 'Kamu ve akademik yabancı dil yeterlilik sınavı',
  sections: [
    {
      code: 'INGILIZCE',
      name: 'İngilizce',
      subjects: [{ code: 'E_YDS_ENG', name: 'İngilizce', topics: INGILIZCE_YDS_TOPICS }],
    },
  ],
};

export const YOKDIL_CURRICULUM: CurriculumExam = {
  code: 'YOKDIL',
  name: 'YÖKDİL',
  description: 'Yükseköğretim Kurumları Yabancı Dil Sınavı — alan bazlı İngilizce',
  sections: [
    {
      code: 'SAGLIK_BILIMLERI',
      name: 'Sağlık Bilimleri',
      subjects: [{ code: 'YOKDIL_SB', name: 'Sağlık Bilimleri', topics: yokdilFieldTopics('SAGLIK') }],
    },
    {
      code: 'SOSYAL_BILIMLER',
      name: 'Sosyal Bilimler',
      subjects: [{ code: 'YOKDIL_SOS', name: 'Sosyal Bilimler', topics: yokdilFieldTopics('SOSYAL') }],
    },
    {
      code: 'FEN_BILIMLERI',
      name: 'Fen Bilimleri',
      subjects: [{ code: 'YOKDIL_FEN', name: 'Fen Bilimleri', topics: yokdilFieldTopics('FEN') }],
    },
  ],
};
