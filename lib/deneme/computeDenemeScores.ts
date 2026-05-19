/**
 * Deneme kaydı puan/net hesaplama — POST handler iş mantığı (DRY).
 */

import { getMaxScoreForExam } from '@/lib/constants/examScoreRanges';
import { calculateExamScore } from '@/lib/scoring/calculateExamScore';
import { getExamScoringProfile } from '@/lib/scoring/examScoringConfig';
import { loadSectionPopulationStats } from '@/lib/scoring/populationStats';
import { prisma } from '@/lib/db/prisma';
import { findExamSectionsForScoring } from '@/lib/deneme/denemeRepository';

export type DenemeBreakdownItem = {
  subjectId: string;
  subjectName: string;
  right: number;
  wrong: number;
  empty: number;
};

export type ComputeDenemeScoresInput = {
  examId: string;
  examCode: string;
  totalScore?: number | null;
  netScore?: number | null;
  rightCount?: number | null;
  wrongCount?: number | null;
  emptyCount?: number | null;
  breakdown?: DenemeBreakdownItem[];
};

export type ComputedDenemeScores = {
  finalTotalScore?: number;
  finalNetScore?: number;
  finalRightCount?: number;
  finalWrongCount?: number;
  finalEmptyCount?: number;
  breakdownJson?: unknown;
};

export async function computeDenemeScores(input: ComputeDenemeScoresInput): Promise<ComputedDenemeScores> {
  let finalTotalScore = input.totalScore ?? undefined;
  let finalNetScore = input.netScore ?? undefined;
  let finalRightCount = input.rightCount ?? undefined;
  let finalWrongCount = input.wrongCount ?? undefined;
  let finalEmptyCount = input.emptyCount ?? undefined;
  let breakdownJson: unknown = undefined;

  const maxScore = getMaxScoreForExam(input.examCode);
  const profile = getExamScoringProfile(input.examCode);
  const examSections = await findExamSectionsForScoring(input.examId);
  const populationStats = await loadSectionPopulationStats(prisma, input.examId, profile.sectionGroups);

  if (input.breakdown && input.breakdown.length > 0) {
    const scored = calculateExamScore({
      examCode: input.examCode,
      breakdown: input.breakdown,
      maxScore,
      sections: examSections,
      populationStats,
    });
    breakdownJson = scored.breakdownWithNet;
    finalRightCount = finalRightCount ?? scored.totalRight;
    finalWrongCount = finalWrongCount ?? scored.totalWrong;
    finalEmptyCount = finalEmptyCount ?? scored.totalEmpty;
    finalTotalScore = finalTotalScore ?? scored.calculatedScore;
    finalNetScore = finalNetScore ?? scored.totalNet;
  } else if ((finalRightCount ?? 0) + (finalWrongCount ?? 0) + (finalEmptyCount ?? 0) > 0) {
    const r = finalRightCount ?? 0;
    const w = finalWrongCount ?? 0;
    const e = finalEmptyCount ?? 0;
    const scored = calculateExamScore({
      examCode: input.examCode,
      breakdown: [],
      maxScore,
      simpleTotals: { right: r, wrong: w, empty: e },
    });
    finalNetScore = finalNetScore ?? scored.totalNet;
    if (finalTotalScore == null) {
      finalTotalScore = scored.calculatedScore;
    }
  }

  return {
    finalTotalScore,
    finalNetScore,
    finalRightCount,
    finalWrongCount,
    finalEmptyCount,
    breakdownJson,
  };
}
