import type { KnowledgeProgressInput, MasteryLevel } from '@/lib/deneme/analysis/types';

const STATUS_BASE: Record<KnowledgeProgressInput['status'], number> = {
  NOT_STARTED: 0,
  IN_PROGRESS: 28,
  COMPLETED: 62,
  REVIEWED: 78,
};

export function getMasteryLevel(score: number): MasteryLevel {
  if (score >= 80) return 'mastered';
  if (score >= 60) return 'intermediate';
  if (score >= 30) return 'learning';
  return 'beginner';
}

export function getMasteryLevelLabel(level: MasteryLevel): string {
  const labels: Record<MasteryLevel, string> = {
    beginner: 'Başlangıç',
    learning: 'Öğreniyor',
    intermediate: 'Orta',
    mastered: 'Hakim',
  };
  return labels[level];
}

/** Konu ustalık skoru — tamamlama, test, tekrar ve güncellik bileşenleri */
export function computeKnowledgeScore(input: KnowledgeProgressInput, now = Date.now()): number {
  const statusScore = STATUS_BASE[input.status] ?? 0;

  let practiceScore = 0;
  if (input.totalQuestions > 0) {
    practiceScore = (input.correctAnswers / input.totalQuestions) * 100;
  } else if (input.status === 'COMPLETED' || input.status === 'REVIEWED') {
    practiceScore = 50;
  }

  const srsScore = Math.min(100, input.spacedRepetitionLevel * 22);

  let recencyBonus = 0;
  const referenceDate = input.lastReviewedAt ?? input.completedAt;
  if (referenceDate) {
    const daysSince = (now - referenceDate.getTime()) / 86_400_000;
    if (daysSince <= 7) recencyBonus = 12;
    else if (daysSince <= 21) recencyBonus = 7;
    else if (daysSince <= 45) recencyBonus = 3;
  }

  const weighted =
    statusScore * 0.34 + practiceScore * 0.36 + srsScore * 0.18 + recencyBonus * 0.12;

  return Math.round(Math.min(100, Math.max(0, weighted)) * 10) / 10;
}

export function computePerformanceScore(right: number, questionCount: number): number | null {
  if (questionCount <= 0) return null;
  return Math.round((right / questionCount) * 1000) / 10;
}
