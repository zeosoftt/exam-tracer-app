/**
 * ÖSYM uyumlu deneme puan hesaplama motoru
 */

import { getMaxScoreForExam } from '@/lib/constants/examScoreRanges';
import { getExamScoringProfile, type ExamScoringProfile } from './examScoringConfig';
import {
  breakdownWithNets,
  buildSubjectToSectionMap,
  clampScore,
  sectionNetsFromBreakdown,
  spFromNet,
  sumBreakdown,
  weightedScore,
  scaleSpToMax,
  subjectNet,
  type BreakdownItem,
  type BreakdownWithNet,
} from './osymCore';
import type { SectionPopulationStats } from './populationStats';

export type { BreakdownItem, BreakdownWithNet };

export interface ExamScoreInput {
  examCode: string;
  breakdown: BreakdownItem[];
  maxScore?: number;
  /** DB sections + subjects (sectionCode eşlemesi için) */
  sections?: Array<{ code: string; subjects: Array<{ id: string }> }>;
  populationStats?: SectionPopulationStats | null;
  simpleTotals?: { right: number; wrong: number; empty: number };
}

export interface ExamScoreResult {
  totalRight: number;
  totalWrong: number;
  totalEmpty: number;
  totalQuestions: number;
  totalNet: number;
  calculatedScore: number;
  scoreLabel: string;
  breakdownWithNet: BreakdownWithNet[];
  sectionNets: Record<string, number>;
  sectionSP: Record<string, number>;
  variants: Record<string, number>;
}

function resolveSp(
  sectionKey: string,
  net: number,
  profile: ExamScoringProfile,
  populationStats: SectionPopulationStats | null | undefined,
): number {
  const group = profile.sectionGroups.find((g) => g.key === sectionKey);
  const stats = populationStats?.[sectionKey];
  const mean = stats?.mean ?? group?.defaultMean ?? 30;
  const std = stats?.std && stats.std > 0 ? stats.std : group?.defaultStd ?? 10;
  return spFromNet(net, mean, std);
}

function computeSectionNetsAndSP(
  breakdown: BreakdownWithNet[],
  profile: ExamScoringProfile,
  subjectToSection: Map<string, string>,
  populationStats: SectionPopulationStats | null | undefined,
): { sectionNets: Record<string, number>; sectionSP: Record<string, number> } {
  const sectionNets: Record<string, number> = {};
  const sectionSP: Record<string, number> = {};

  for (const group of profile.sectionGroups) {
    const net = sectionNetsFromBreakdown(breakdown, subjectToSection, group.sectionCodes);
    sectionNets[group.key] = Math.round(net * 100) / 100;
    sectionSP[group.key] = resolveSp(group.key, net, profile, populationStats);
  }

  return { sectionNets, sectionSP };
}

function scoreKpss(
  profile: ExamScoringProfile,
  sectionSP: Record<string, number>,
  maxScore: number,
): { calculatedScore: number; variants: Record<string, number> } {
  const gy = sectionSP.GY ?? 50;
  const gk = sectionSP.GK ?? 50;
  const eb = sectionSP.EB;
  const oabt = sectionSP.OABT;
  const w = profile.kpss!;

  const variants: Record<string, number> = {
    P1: weightedScore([
      { sp: gy, weight: w.P1.gy },
      { sp: gk, weight: w.P1.gk },
    ]),
    P2: weightedScore([
      { sp: gy, weight: w.P2.gy },
      { sp: gk, weight: w.P2.gk },
    ]),
    P3: weightedScore([
      { sp: gy, weight: w.P3.gy },
      { sp: gk, weight: w.P3.gk },
    ]),
  };

  if (w.P10 && eb != null) {
    variants.P10 = weightedScore([
      { sp: gy, weight: w.P10.gy },
      { sp: gk, weight: w.P10.gk },
      { sp: eb, weight: w.P10.eb },
    ]);
  }

  if (w.P121 && eb != null && oabt != null) {
    variants.P121 = weightedScore([
      { sp: gy, weight: w.P121.gy },
      { sp: gk, weight: w.P121.gk },
      { sp: eb, weight: w.P121.eb },
      { sp: oabt, weight: w.P121.oabt },
    ]);
  }

  const primary = variants[profile.primaryScoreKey] ?? variants.P3;
  return { calculatedScore: clampScore(primary, maxScore), variants };
}

function scoreAles(
  profile: ExamScoringProfile,
  sectionSP: Record<string, number>,
  maxScore: number,
): { calculatedScore: number; variants: Record<string, number> } {
  const saySp = sectionSP.SAY ?? 50;
  const sozSp = sectionSP.SOZ ?? 50;

  const variants: Record<string, number> = {
    SAY: clampScore(saySp * 0.75 + sozSp * 0.25, maxScore),
    EA: clampScore(saySp * 0.5 + sozSp * 0.5, maxScore),
    SOZ: clampScore(saySp * 0.25 + sozSp * 0.75, maxScore),
  };

  const primary = variants[profile.primaryScoreKey] ?? variants.EA;
  return { calculatedScore: primary, variants };
}

function scoreDgs(
  profile: ExamScoringProfile,
  sectionSP: Record<string, number>,
  maxScore: number,
): { calculatedScore: number; variants: Record<string, number> } {
  const saySp = sectionSP.SAY ?? 50;
  const sozSp = sectionSP.SOZ ?? 50;
  const w = profile.dgs!;
  const asp = weightedScore([
    { sp: saySp, weight: w.sayisal },
    { sp: sozSp, weight: w.sozel },
  ]);
  const score = scaleSpToMax(asp, maxScore);
  return { calculatedScore: score, variants: { DGS: score } };
}

function scoreYksTyt(
  profile: ExamScoringProfile,
  sectionNets: Record<string, number>,
  maxScore: number,
): { calculatedScore: number; variants: Record<string, number> } {
  const coeffs = profile.tyt!;
  let raw = 100;
  for (const [key, k] of Object.entries(coeffs)) {
    raw += (sectionNets[key] ?? 0) * k;
  }
  const score = clampScore(raw, maxScore);
  return { calculatedScore: score, variants: { TYT: score } };
}

function scoreYdsDirect(
  profile: ExamScoringProfile,
  totals: { totalRight: number; totalQuestions: number },
  maxScore: number,
): { calculatedScore: number; variants: Record<string, number> } {
  const qCount = profile.ydsQuestionCount ?? 80;
  const effectiveQ = totals.totalQuestions > 0 ? totals.totalQuestions : qCount;
  const score =
    effectiveQ > 0
      ? clampScore((totals.totalRight / qCount) * 100, maxScore)
      : 0;
  return { calculatedScore: score, variants: { PUAN: score } };
}

function scoreSpWeighted(
  profile: ExamScoringProfile,
  sectionSP: Record<string, number>,
  maxScore: number,
): { calculatedScore: number; variants: Record<string, number> } {
  const keys = profile.sectionGroups.map((g) => g.key);
  if (keys.length === 0) {
    return { calculatedScore: 50, variants: {} };
  }
  const asp =
    keys.reduce((s, k) => s + (sectionSP[k] ?? 50), 0) / keys.length;
  const score = scaleSpToMax(asp, maxScore);
  return {
    calculatedScore: score,
    variants: { [profile.primaryScoreKey]: score },
  };
}

function scoreNetRatio(
  totalNet: number,
  totalQuestions: number,
  maxScore: number,
): { calculatedScore: number; variants: Record<string, number> } {
  const score =
    totalQuestions > 0
      ? clampScore((totalNet / totalQuestions) * maxScore, maxScore)
      : 0;
  return { calculatedScore: score, variants: { PUAN: score } };
}

export function calculateExamScore(input: ExamScoreInput): ExamScoreResult {
  const profile = getExamScoringProfile(input.examCode);
  const maxScore = input.maxScore ?? getMaxScoreForExam(input.examCode);

  if (input.simpleTotals && input.breakdown.length === 0) {
    const { right, wrong, empty } = input.simpleTotals;
    const totalQuestions = right + wrong + empty;
    const totalNet = subjectNet(right, wrong);
    const totals = { totalRight: right, totalWrong: wrong, totalEmpty: empty, totalQuestions, totalNet };

    if (profile.type === 'yds_direct') {
      const { calculatedScore, variants } = scoreYdsDirect(
        profile,
        { totalRight: right, totalQuestions },
        maxScore,
      );
      return {
        ...totals,
        calculatedScore,
        scoreLabel: profile.primaryScoreKey,
        breakdownWithNet: [],
        sectionNets: {},
        sectionSP: {},
        variants,
      };
    }

    const { calculatedScore, variants } = scoreNetRatio(totalNet, totalQuestions, maxScore);
    return {
      ...totals,
      calculatedScore,
      scoreLabel: profile.primaryScoreKey,
      breakdownWithNet: [],
      sectionNets: {},
      sectionSP: {},
      variants,
    };
  }

  const breakdown = breakdownWithNets(input.breakdown);
  const totals = sumBreakdown(breakdown);
  const subjectToSection = input.sections
    ? buildSubjectToSectionMap(input.sections)
    : new Map<string, string>();

  const { sectionNets, sectionSP } = computeSectionNetsAndSP(
    breakdown,
    profile,
    subjectToSection,
    input.populationStats,
  );

  let calculatedScore: number;
  let variants: Record<string, number> = {};

  switch (profile.type) {
    case 'kpss': {
      const r = scoreKpss(profile, sectionSP, maxScore);
      calculatedScore = r.calculatedScore;
      variants = r.variants;
      break;
    }
    case 'ales': {
      const r = scoreAles(profile, sectionSP, maxScore);
      calculatedScore = r.calculatedScore;
      variants = r.variants;
      break;
    }
    case 'dgs': {
      const r = scoreDgs(profile, sectionSP, maxScore);
      calculatedScore = r.calculatedScore;
      variants = r.variants;
      break;
    }
    case 'yks_tyt': {
      const r = scoreYksTyt(profile, sectionNets, maxScore);
      calculatedScore = r.calculatedScore;
      variants = r.variants;
      break;
    }
    case 'yds_direct': {
      const r = scoreYdsDirect(
        profile,
        { totalRight: totals.totalRight, totalQuestions: totals.totalQuestions },
        maxScore,
      );
      calculatedScore = r.calculatedScore;
      variants = r.variants;
      break;
    }
    case 'sp_weighted': {
      const r = scoreSpWeighted(profile, sectionSP, maxScore);
      calculatedScore = r.calculatedScore;
      variants = r.variants;
      break;
    }
    case 'net_ratio':
    default: {
      const r = scoreNetRatio(totals.totalNet, totals.totalQuestions, maxScore);
      calculatedScore = r.calculatedScore;
      variants = r.variants;
    }
  }

  return {
    ...totals,
    calculatedScore,
    scoreLabel: profile.primaryScoreKey,
    breakdownWithNet: breakdown,
    sectionNets,
    sectionSP,
    variants,
  };
}
