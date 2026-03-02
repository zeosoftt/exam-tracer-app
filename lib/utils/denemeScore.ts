/**
 * Deneme net ve puan hesaplama
 * Net = Doğru - Yanlış/4 (standart formül)
 * Puan = (Toplam Net / Toplam Soru) * maxScore (sınav türüne göre 100 veya 500)
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
 * Ders bazlı net: doğru - yanlış/4
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
