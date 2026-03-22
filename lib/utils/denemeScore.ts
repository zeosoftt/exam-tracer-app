/**
 * Deneme net ve puan hesaplama
 * Net = Doğru - Yanlış/4 (standart formül)
 * KPSS: GY/GK bölüm netleri → z skoru → standart puan (SP) → P1, P2, P3
 */

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

const YANLIS_CEZASI = 4; // 4 yanlış 1 doğru götürür

/**
 * Ders bazlı net: Doğru - (Yanlış / 4)
 */
export function subjectNet(right: number, wrong: number): number {
  return right - wrong / YANLIS_CEZASI;
}

export interface CalculateFromBreakdownOptions {
  /** Sınav türüne göre üst puan (örn. 100 veya 500). Varsayılan 100. */
  maxScore?: number;
}

/**
 * Breakdown dizisinden toplam net, toplam soru ve hesaplanan puan
 * KPSS dışı sınavlar için kullanılır; KPSS için calculateKpssFromBreakdown kullanın.
 */
export function calculateFromBreakdown(
  items: BreakdownItem[],
  options: CalculateFromBreakdownOptions = {}
): {
  totalRight: number;
  totalWrong: number;
  totalEmpty: number;
  totalQuestions: number;
  totalNet: number;
  calculatedScore: number;
  breakdownWithNet: BreakdownWithNet[];
} {
  const maxScore = options.maxScore ?? 100;

  const breakdownWithNet: BreakdownWithNet[] = items.map((item) => ({
    ...item,
    net: subjectNet(item.right, item.wrong),
  }));

  const totalRight = breakdownWithNet.reduce((s, i) => s + i.right, 0);
  const totalWrong = breakdownWithNet.reduce((s, i) => s + i.wrong, 0);
  const totalEmpty = breakdownWithNet.reduce((s, i) => s + i.empty, 0);
  const totalQuestions = totalRight + totalWrong + totalEmpty;
  const totalNet = breakdownWithNet.reduce((s, i) => s + i.net, 0);

  let calculatedScore = 0;
  if (totalQuestions > 0) {
    calculatedScore = Math.round((totalNet / totalQuestions) * maxScore * 100) / 100;
    calculatedScore = Math.max(0, Math.min(maxScore, calculatedScore));
  }

  return {
    totalRight,
    totalWrong,
    totalEmpty,
    totalQuestions,
    totalNet,
    calculatedScore,
    breakdownWithNet,
  };
}

// --- KPSS: Standart sapma, z skoru, standart puan, P1/P2/P3 ---

/** σ = sqrt( Σ(xi - μ)² / N ) */
export function standardDeviation(values: number[]): number {
  const N = values.length;
  if (N === 0) return 0;
  const mu = values.reduce((s, x) => s + x, 0) / N;
  const sumSq = values.reduce((s, x) => s + (x - mu) ** 2, 0);
  return Math.sqrt(sumSq / N);
}

/** z = (X - μ) / σ; σ=0 ise 0 döner */
export function zScore(x: number, mu: number, sigma: number): number {
  if (sigma === 0) return 0;
  return (x - mu) / sigma;
}

/** Standart puan: SP = 50 + (10 × z) */
export function standardScore(z: number): number {
  return 50 + 10 * z;
}

/** KPSS puan türleri */
export function kpssPuanlari(gySP: number, gkSP: number): { P1: number; P2: number; P3: number } {
  return {
    P1: Math.round((gySP * 0.7 + gkSP * 0.3) * 100) / 100,
    P2: Math.round((gySP * 0.6 + gkSP * 0.4) * 100) / 100,
    P3: Math.round((gySP * 0.5 + gkSP * 0.5) * 100) / 100,
  };
}

/** Bölüm–ders eşlemesi: hangi subjectId hangi bölüme ait (GY / GK) */
export interface KpssSectionSubjectIds {
  GY: string[];
  GK: string[];
}

/** Breakdown'dan GY ve GK toplam netlerini hesapla */
export function sectionNetsFromBreakdown(
  breakdown: BreakdownWithNet[],
  sectionSubjectIds: KpssSectionSubjectIds
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

export interface KpssPopulationStats {
  gyMean: number;
  gyStd: number;
  gkMean: number;
  gkStd: number;
  sampleSize: number;
}

/** KPSS için GY/GK net → z → SP → P1, P2, P3. Veri yoksa σ=10, μ=30 varsayımı. */
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
  const { breakdownWithNet, sectionSubjectIds, stats } = options;
  const totalRight = breakdownWithNet.reduce((s, i) => s + i.right, 0);
  const totalWrong = breakdownWithNet.reduce((s, i) => s + i.wrong, 0);
  const totalEmpty = breakdownWithNet.reduce((s, i) => s + i.empty, 0);
  const totalQuestions = totalRight + totalWrong + totalEmpty;
  const totalNet = breakdownWithNet.reduce((s, i) => s + i.net, 0);

  const { gyNet, gkNet } = sectionNetsFromBreakdown(breakdownWithNet, sectionSubjectIds);

  const gyMean = stats?.gyMean ?? 30;
  const gyStd = stats?.gyStd && stats.gyStd > 0 ? stats.gyStd : 10;
  const gkMean = stats?.gkMean ?? 30;
  const gkStd = stats?.gkStd && stats.gkStd > 0 ? stats.gkStd : 10;

  const gyZ = zScore(gyNet, gyMean, gyStd);
  const gkZ = zScore(gkNet, gkMean, gkStd);
  const gySP = Math.max(0, Math.min(100, standardScore(gyZ)));
  const gkSP = Math.max(0, Math.min(100, standardScore(gkZ)));
  const { P1, P2, P3 } = kpssPuanlari(gySP, gkSP);

  return {
    totalRight,
    totalWrong,
    totalEmpty,
    totalQuestions,
    totalNet,
    gyNet,
    gkNet,
    gyZ,
    gkZ,
    gySP,
    gkSP,
    P1,
    P2,
    P3,
    calculatedScore: P3,
    breakdownWithNet,
  };
}
