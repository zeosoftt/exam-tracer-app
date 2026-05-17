/**
 * ÖSYM temel hesaplama bileşenleri
 * Net = Doğru - Yanlış/4
 * SP = ((Ham - μ) / σ) × 10 + 50
 */

export const OSYM_WRONG_PENALTY = 4;

export function subjectNet(right: number, wrong: number): number {
  return right - wrong / OSYM_WRONG_PENALTY;
}

export function standardDeviation(values: number[]): number {
  const n = values.length;
  if (n === 0) return 0;
  const mu = values.reduce((s, x) => s + x, 0) / n;
  const sumSq = values.reduce((s, x) => s + (x - mu) ** 2, 0);
  return Math.sqrt(sumSq / n);
}

export function zScore(x: number, mu: number, sigma: number): number {
  if (sigma <= 0) return 0;
  return (x - mu) / sigma;
}

/** Standart puan: SP = 50 + 10×z, 0–100 arası */
export function standardScore(z: number): number {
  const sp = 50 + 10 * z;
  return Math.max(0, Math.min(100, Math.round(sp * 100) / 100));
}

export function spFromNet(
  net: number,
  mean: number,
  std: number,
): number {
  return standardScore(zScore(net, mean, std));
}

export function weightedScore(
  components: Array<{ sp: number; weight: number }>,
): number {
  const sum = components.reduce((s, c) => s + c.sp * c.weight, 0);
  return Math.round(sum * 100) / 100;
}

export function clampScore(score: number, maxScore: number): number {
  return Math.max(0, Math.min(maxScore, Math.round(score * 100) / 100));
}

/** SP (0–100) → sınav ölçeğine (ör. DGS/TYT 500) */
export function scaleSpToMax(sp: number, maxScore: number): number {
  if (maxScore <= 100) return clampScore(sp, maxScore);
  return clampScore((sp / 100) * maxScore, maxScore);
}

export interface BreakdownItem {
  subjectId: string;
  subjectName: string;
  right: number;
  wrong: number;
  empty: number;
}

export interface BreakdownWithNet extends BreakdownItem {
  net: number;
}

export function breakdownWithNets(items: BreakdownItem[]): BreakdownWithNet[] {
  return items.map((item) => ({
    ...item,
    net: subjectNet(item.right, item.wrong),
  }));
}

export function sumBreakdown(breakdown: BreakdownWithNet[]) {
  const totalRight = breakdown.reduce((s, i) => s + i.right, 0);
  const totalWrong = breakdown.reduce((s, i) => s + i.wrong, 0);
  const totalEmpty = breakdown.reduce((s, i) => s + i.empty, 0);
  const totalQuestions = totalRight + totalWrong + totalEmpty;
  const totalNet = breakdown.reduce((s, i) => s + i.net, 0);
  return { totalRight, totalWrong, totalEmpty, totalQuestions, totalNet };
}

/** Bölüm kodlarına göre net toplama (subjectId → sectionCode eşlemesi gerekir) */
export function sectionNetsFromBreakdown(
  breakdown: BreakdownWithNet[],
  subjectToSection: Map<string, string>,
  sectionCodes: string[],
): number {
  const codeSet = new Set(sectionCodes);
  let net = 0;
  for (const item of breakdown) {
    const section = subjectToSection.get(item.subjectId);
    if (section && codeSet.has(section)) net += item.net;
  }
  return net;
}

export function buildSubjectToSectionMap(
  sections: Array<{ code: string; subjects: Array<{ id: string }> }>,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const sec of sections) {
    for (const sub of sec.subjects) {
      map.set(sub.id, sec.code);
    }
  }
  return map;
}
