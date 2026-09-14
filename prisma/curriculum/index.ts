import type { CurriculumExam } from './types';
import { ALES_CURRICULUM } from './exams/ales';
import { DGS_CURRICULUM } from './exams/dgs';
import { OABT_CURRICULUM } from './exams/oabt';
import { YKS_AYT_CURRICULUM } from './exams/yksAyt';
import { YKS_TYT_CURRICULUM } from './exams/yksTyt';
import { E_YDS_CURRICULUM, YKS_YDT_CURRICULUM, YOKDIL_CURRICULUM } from './exams/yds';

/** KPSS seed.ts içinde ayrı tutulur; diğer tüm sınav müfredatları */
export const CURRICULUM_EXAMS: CurriculumExam[] = [
  ALES_CURRICULUM,
  DGS_CURRICULUM,
  YKS_TYT_CURRICULUM,
  YKS_AYT_CURRICULUM,
  YKS_YDT_CURRICULUM,
  E_YDS_CURRICULUM,
  YOKDIL_CURRICULUM,
  OABT_CURRICULUM,
];

export { upsertExamTree, upsertExamTrees } from './upsertExam';
