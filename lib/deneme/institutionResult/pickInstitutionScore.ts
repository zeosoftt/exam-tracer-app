import { getExamScoringProfile } from '@/lib/scoring/examScoringConfig';
import type { InstitutionScoreResult } from '@/lib/deneme/institutionResult/types';

function normalizeScoreType(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
    .replace(/\s*PUAN(I|LARI)?$/i, '')
    .trim();
}

function scoreTypeMatches(scoreType: string, key: string): boolean {
  const normalized = normalizeScoreType(scoreType);
  const normalizedKey = key.toUpperCase();
  if (normalized === normalizedKey) return true;
  return normalized.startsWith(`${normalizedKey} `);
}

function findScoreByKey(scores: InstitutionScoreResult[], key: string): number | null {
  const match = scores.find((entry) => scoreTypeMatches(entry.type, key));
  if (match && Number.isFinite(match.score) && match.score > 0) {
    return match.score;
  }
  return null;
}

/** Kurum sonuç tablosundan sınav koduna uygun puanı seçer. */
export function pickInstitutionScoreForExam(
  scores: InstitutionScoreResult[],
  examCode: string,
): number | null {
  if (scores.length === 0) return null;

  const profile = getExamScoringProfile(examCode);
  const primary = findScoreByKey(scores, profile.primaryScoreKey);
  if (primary != null) return primary;

  if (examCode.startsWith('KPSS')) {
    for (const key of ['P3', 'P2', 'P1', 'P10', 'P121']) {
      const match = findScoreByKey(scores, key);
      if (match != null) return match;
    }
  }

  const firstPositive = scores.find((entry) => Number.isFinite(entry.score) && entry.score > 0);
  return firstPositive?.score ?? null;
}
