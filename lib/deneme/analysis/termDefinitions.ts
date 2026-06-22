export type AnalysisTermKey =
  | 'knowledge'
  | 'performance'
  | 'gap'
  | 'application'
  | 'impact'
  | 'fakeMastery'
  | 'gapRisky'
  | 'gapCritical'
  | 'strongTransfer'
  | 'overallHealth';

export type AnalysisTermDefinition = {
  title: string;
  shortLabel: string;
  description: string;
  formula?: string;
  example?: string;
};

export const ANALYSIS_TERMS: Record<AnalysisTermKey, AnalysisTermDefinition> = {
  knowledge: {
    title: 'Konu bilgisi (Ustalık skoru)',
    shortLabel: 'Konu bilgisi',
    description:
      'Konu takibindeki verilerden hesaplanır: tamamlama durumu, test doğruluğu, aralıklı tekrar ve güncellik.',
    formula: '0–100 arası · 80+ Hakim · 60–80 Orta · 30–60 Öğreniyor · 0–30 Başlangıç',
  },
  performance: {
    title: 'Deneme başarısı',
    shortLabel: 'Deneme başarısı',
    description: 'Bu denemede o konudan kaç soru geldi ve kaçını doğru yaptınız?',
    formula: 'Deneme başarısı = (Doğru ÷ Sorulan) × 100',
    example: '4 sorudan 1 doğru → %25',
  },
  gap: {
    title: 'Bilgi farkı (Gap)',
    shortLabel: 'Bilgi farkı',
    description:
      'Konu takibindeki bilgi ile denemede gösterdiğiniz performans arasındaki fark. Pozitif (+): bildiğiniz halde yapamadınız (sorun). Negatif (−): çalışmasanız da denemede iyi yaptınız (olumlu).',
    formula: 'Bilgi farkı = Konu bilgisi − Deneme başarısı',
    example: 'Takip %20, deneme %80 → fark −60 (denemede güçlü · iyi)',
  },
  application: {
    title: 'Aktarım oranı (Transfer)',
    shortLabel: 'Aktarım oranı',
    description: 'Öğrendiğiniz bilginin denemeye ne kadar yansıdığını gösterir. Yüksek oran iyi aktarım demektir.',
    formula: 'Aktarım = (Deneme başarısı ÷ Konu bilgisi) × 100',
    example: 'Ustalık %80, deneme %64 → aktarım %80',
  },
  impact: {
    title: 'Öncelik etkisi (Etki skoru)',
    shortLabel: 'Öncelik etkisi',
    description:
      'Hangi konuya önce müdahale etmeniz gerektiğini sıralar. Yalnızca bilgi > deneme (pozitif fark) olan konularda hesaplanır.',
    formula: 'Etki = Bilgi farkı × (Bu konudaki soru sayısı ÷ Toplam soru) · yalnız pozitif fark',
    example: 'Fark +40, 5 soruluk konu → etki yüksek; denemede üstün (−fark) konular → etki 0',
  },
  fakeMastery: {
    title: 'Yanıltıcı öğrenme',
    shortLabel: 'Yanıltıcı öğrenme',
    description:
      'Konu tamamlanmış veya çok iyi görünüyor ama denemede başarısız olundu. Gerçek öğrenme yerine yüzeysel tamamlama olabilir.',
    formula: 'Konu bilgisi ≥ %80 ve deneme başarısı < %50',
  },
  gapRisky: {
    title: 'Riskli bilgi farkı',
    shortLabel: 'Riskli fark',
    description: 'Konu bilgisi deneme başarısından belirgin yüksek. Öğrendiğiniz halde sınavda yansıtamıyorsunuz.',
    formula: 'Pozitif bilgi farkı 10–30 arası',
  },
  gapCritical: {
    title: 'Ciddi bilgi farkı',
    shortLabel: 'Ciddi fark',
    description: 'Konu bilgisi yüksek ama denemede çok düşük. Acil pekiştirme gerekir.',
    formula: 'Pozitif bilgi farkı 30 ve üzeri',
  },
  strongTransfer: {
    title: 'İyi aktarım',
    shortLabel: 'İyi aktarım',
    description: 'Öğrendiğiniz bilgi denemeye başarıyla yansımış. Konu bilgisi ile deneme sonucu uyumlu.',
    formula: 'Aktarım ≥ %85 ve bilgi farkı normal',
  },
  overallHealth: {
    title: 'Genel durum',
    shortLabel: 'Genel durum',
    description: 'Bu denemedeki tüm konuların bilgi–deneme uyumuna göre genel sağlık değerlendirmesi.',
  },
};

export const GAP_RISK_LABELS_TR: Record<'normal' | 'risky' | 'critical', string> = {
  normal: 'Normal (0–10)',
  risky: 'Riskli (10–30)',
  critical: 'Ciddi (30+)',
};

export function getGapBadgeLabel(gap: number, gapRisk: 'normal' | 'risky' | 'critical'): string {
  if (gap < 0) return 'Denemede üstün (iyi)';
  return GAP_RISK_LABELS_TR[gapRisk];
}
