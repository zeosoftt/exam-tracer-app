import type { GapRiskLevel } from '@/lib/deneme/analysis/types';

export function computeKnowledgeGap(knowledgeScore: number, performanceScore: number): number {
  return Math.round((knowledgeScore - performanceScore) * 10) / 10;
}

/** Risk yalnızca bilgi > deneme (pozitif gap) olduğunda — denemede üstün performans sorun değildir */
export function getGapRiskLevel(gap: number): GapRiskLevel {
  if (gap <= 0) return 'normal';
  if (gap >= 30) return 'critical';
  if (gap >= 10) return 'risky';
  return 'normal';
}

export function isDenemeOutperforming(gap: number): boolean {
  return gap < 0;
}

export function getGapRiskLabel(risk: GapRiskLevel): string {
  const labels: Record<GapRiskLevel, string> = {
    normal: 'Normal',
    risky: 'Riskli',
    critical: 'Ciddi problem',
  };
  return labels[risk];
}

/** Transfer başarısı — bilginin denemeye yansıma oranı */
export function computeApplicationRate(knowledgeScore: number, performanceScore: number): number {
  if (knowledgeScore <= 0) {
    return performanceScore > 0 ? Math.round(performanceScore * 10) / 10 : 0;
  }
  const rate = (performanceScore / knowledgeScore) * 100;
  return Math.round(Math.min(100, Math.max(0, rate)) * 10) / 10;
}

/** Yanıltıcı öğrenme — yüksek konu skoru + düşük deneme skoru */
export function computeFakeMasteryScore(
  knowledgeScore: number,
  performanceScore: number,
): { fakeMastery: boolean; score: number } {
  const isHighKnowledge = knowledgeScore >= 80;
  const isLowPerformance = performanceScore < 50;
  const fakeMastery = isHighKnowledge && isLowPerformance;
  const score = fakeMastery ? Math.round((knowledgeScore - performanceScore) * 10) / 10 : 0;
  return { fakeMastery, score };
}

/** Etki skoru — yalnızca pozitif gap (bilgi > deneme) için öncelik */
export function computeImpactScore(gap: number, questionCount: number, totalQuestionsAsked: number): number {
  if (gap <= 0 || totalQuestionsAsked <= 0 || questionCount <= 0) return 0;
  const weight = questionCount / totalQuestionsAsked;
  return Math.round(gap * weight * 100) / 100;
}

export function buildTopicRecommendation(input: {
  fakeMastery: boolean;
  gapRisk: GapRiskLevel | null;
  gap: number | null;
  knowledgeScore: number;
  performanceScore: number | null;
  applicationRate: number | null;
}): string {
  if (input.fakeMastery) {
    return 'Konu tamamlanmış görünüyor ama denemede aktarılamıyor. Aktif tekrar ve deneme odaklı soru çözün.';
  }
  if (input.gap != null && input.gap < 0 && (input.performanceScore ?? 0) >= 50) {
    return 'Konu takibinde az çalışmış olsanız da denemede başarılısınız. Takibe alarak bu seviyeyi kalıcı hale getirin.';
  }
  if (input.gapRisk === 'critical') {
    return 'Bilgi ile uygulama arasında ciddi fark var. Konuyu baştan pekiştirin ve deneme tarzı soru çözün.';
  }
  if (input.gapRisk === 'risky') {
    return 'Riskli alan: öğrenme var ama denemeye yeterince yansımıyor. Tekrar + zamanlı mini deneme yapın.';
  }
  if (input.applicationRate != null && input.applicationRate >= 85 && (input.gapRisk === 'normal' || input.gapRisk === null)) {
    return 'Bilgi denemeye iyi yansıyor. Seviyeyi korumak için aralıklı tekrar yeterli.';
  }
  if (input.knowledgeScore < 30) {
    return 'Temel seviyede. Video + test + konu tamamlama ile başlayın.';
  }
  return 'Düzenli tekrar ve deneme sorularıyla dengeyi koruyun.';
}
