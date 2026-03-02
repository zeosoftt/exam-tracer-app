/**
 * Sınav türüne göre puan aralığı (deneme puan hesaplama ve listelemelerde kullanılır)
 */
export const EXAM_SCORE_RANGES: Record<string, { minScore: number; maxScore: number; step: number }> = {
  KPSS: { minScore: 0, maxScore: 100, step: 1 },
  KPSS_ORTAOGRETIM: { minScore: 0, maxScore: 100, step: 1 },
  KPSS_ONLISANS: { minScore: 0, maxScore: 100, step: 1 },
  KPSS_LISANS: { minScore: 0, maxScore: 100, step: 1 },
  ALES: { minScore: 0, maxScore: 100, step: 0.5 },
  DGS: { minScore: 0, maxScore: 500, step: 1 },
  YKS_TYT: { minScore: 0, maxScore: 500, step: 1 },
  YKS_AYT: { minScore: 0, maxScore: 500, step: 1 },
  YKS_YDT: { minScore: 0, maxScore: 500, step: 1 },
  E_YDS: { minScore: 0, maxScore: 100, step: 1 },
  YOKDIL: { minScore: 0, maxScore: 100, step: 1 },
};

export function getMaxScoreForExam(examCode: string): number {
  return EXAM_SCORE_RANGES[examCode]?.maxScore ?? 100;
}
