/**
 * Deneme net ve puan hesaplama (ÖSYM uyumlu)
 * @see lib/scoring/ — çekirdek motor
 */

export type {
  BreakdownItem,
  BreakdownWithNet,
} from '@/lib/scoring/osymCore';

export {
  subjectNet,
  standardDeviation,
  zScore,
  standardScore,
  breakdownWithNets,
} from '@/lib/scoring/osymCore';

export type { ExamScoreInput, ExamScoreResult } from '@/lib/scoring/calculateExamScore';
export { calculateExamScore } from '@/lib/scoring/calculateExamScore';

import { calculateExamScore } from '@/lib/scoring/calculateExamScore';
import type { BreakdownItem, BreakdownWithNet } from '@/lib/scoring/osymCore';

export interface CalculateFromBreakdownOptions {
  maxScore?: number;
  examCode?: string;
}

/**
 * Ders breakdown → net ve puan (sınav kodu verilirse ÖSYM profili uygulanır)
 */
export function calculateFromBreakdown(
  items: BreakdownItem[],
  options: CalculateFromBreakdownOptions = {},
): {
  totalRight: number;
  totalWrong: number;
  totalEmpty: number;
  totalQuestions: number;
  totalNet: number;
  calculatedScore: number;
  breakdownWithNet: BreakdownWithNet[];
} {
  const examCode = options.examCode ?? '__NET_RATIO__';
  const result = calculateExamScore({
    examCode: examCode === '__NET_RATIO__' ? 'UNKNOWN' : examCode,
    breakdown: items,
    maxScore: options.maxScore,
  });
  return {
    totalRight: result.totalRight,
    totalWrong: result.totalWrong,
    totalEmpty: result.totalEmpty,
    totalQuestions: result.totalQuestions,
    totalNet: result.totalNet,
    calculatedScore: result.calculatedScore,
    breakdownWithNet: result.breakdownWithNet,
  };
}

export interface KpssSectionSubjectIds {
  GY: string[];
  GK: string[];
}

export interface KpssPopulationStats {
  gyMean: number;
  gyStd: number;
  gkMean: number;
  gkStd: number;
  sampleSize: number;
}

/** KPSS puan türleri (geriye dönük uyumluluk) */
export function kpssPuanlari(gySP: number, gkSP: number): { P1: number; P2: number; P3: number } {
  return {
    P1: Math.round((gySP * 0.7 + gkSP * 0.3) * 100) / 100,
    P2: Math.round((gySP * 0.6 + gkSP * 0.4) * 100) / 100,
    P3: Math.round((gySP * 0.5 + gkSP * 0.5) * 100) / 100,
  };
}

export function sectionNetsFromBreakdown(
  breakdown: BreakdownWithNet[],
  sectionSubjectIds: KpssSectionSubjectIds,
): { gyNet: number; gkNet: number } {
  const gySet = new Set(sectionSubjectIds.GY);
  const gkSet = new Set(sectionSubjectIds.GK);
  let gyNet = 0;
  let gkNet = 0;
  for (const item of breakdown) {
    if (gySet.has(item.subjectId)) gyNet += item.net;
    else if (gkSet.has(item.subjectId)) gkNet += item.net;
  }
  return { gyNet, gkNet };
}

/** @deprecated calculateExamScore({ examCode: 'KPSS', ... }) kullanın */
export function calculateKpssFromBreakdown(options: {
  breakdownWithNet: BreakdownWithNet[];
  sectionSubjectIds: KpssSectionSubjectIds;
  stats: KpssPopulationStats | null;
}): {
  totalRight: number;
  totalWrong: number;
  totalEmpty: number;
  totalQuestions: number;
  totalNet: number;
  gyNet: number;
  gkNet: number;
  gyZ: number;
  gkZ: number;
  gySP: number;
  gkSP: number;
  P1: number;
  P2: number;
  P3: number;
  calculatedScore: number;
  breakdownWithNet: BreakdownWithNet[];
} {
  const sections = [
    {
      code: 'GENEL_YETENEK',
      subjects: options.sectionSubjectIds.GY.map((id) => ({ id })),
    },
    {
      code: 'GENEL_KULTUR',
      subjects: options.sectionSubjectIds.GK.map((id) => ({ id })),
    },
  ];

  const populationStats = options.stats
    ? {
        GY: {
          mean: options.stats.gyMean,
          std: options.stats.gyStd,
          sampleSize: options.stats.sampleSize,
        },
        GK: {
          mean: options.stats.gkMean,
          std: options.stats.gkStd,
          sampleSize: options.stats.sampleSize,
        },
      }
    : null;

  const result = calculateExamScore({
    examCode: 'KPSS',
    breakdown: options.breakdownWithNet,
    sections,
    populationStats,
  });

  const gyNet = result.sectionNets.GY ?? 0;
  const gkNet = result.sectionNets.GK ?? 0;
  const gySP = result.sectionSP.GY ?? 50;
  const gkSP = result.sectionSP.GK ?? 50;

  const gyMean = options.stats?.gyMean ?? 30;
  const gyStd = options.stats?.gyStd && options.stats.gyStd > 0 ? options.stats.gyStd : 10;
  const gkMean = options.stats?.gkMean ?? 30;
  const gkStd = options.stats?.gkStd && options.stats.gkStd > 0 ? options.stats.gkStd : 10;
  const gyZ = gyStd > 0 ? (gyNet - gyMean) / gyStd : 0;
  const gkZ = gkStd > 0 ? (gkNet - gkMean) / gkStd : 0;

  return {
    totalRight: result.totalRight,
    totalWrong: result.totalWrong,
    totalEmpty: result.totalEmpty,
    totalQuestions: result.totalQuestions,
    totalNet: result.totalNet,
    gyNet,
    gkNet,
    gyZ: Math.round(gyZ * 1000) / 1000,
    gkZ: Math.round(gkZ * 1000) / 1000,
    gySP,
    gkSP,
    P1: result.variants.P1 ?? 0,
    P2: result.variants.P2 ?? 0,
    P3: result.variants.P3 ?? 0,
    calculatedScore: result.calculatedScore,
    breakdownWithNet: result.breakdownWithNet,
  };
}
