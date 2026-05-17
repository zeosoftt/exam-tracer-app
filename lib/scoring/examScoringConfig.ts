/**
 * Sınav türüne göre ÖSYM puan hesaplama profilleri
 */

export type ScoringProfileType =
  | 'kpss'
  | 'ales'
  | 'dgs'
  | 'yks_tyt'
  | 'yds_direct'
  | 'sp_weighted'
  | 'net_ratio';

export interface SectionGroupDef {
  /** Sonuç detayında kullanılan anahtar */
  key: string;
  /** Veritabanı Section.code değerleri */
  sectionCodes: string[];
  /** SP hesabında varsayılan μ (popülasyon yoksa) */
  defaultMean: number;
  /** SP hesabında varsayılan σ */
  defaultStd: number;
}

export interface KpssVariantWeights {
  P1: { gy: number; gk: number };
  P2: { gy: number; gk: number };
  P3: { gy: number; gk: number };
  P10?: { gy: number; gk: number; eb: number };
  P121?: { gy: number; gk: number; eb: number; oabt: number };
}

export interface ExamScoringProfile {
  type: ScoringProfileType;
  primaryScoreKey: string;
  sectionGroups: SectionGroupDef[];
  /** KPSS P1/P2/P3 vb. */
  kpss?: KpssVariantWeights;
  /** ALES: SAY, EA, SÖZ */
  /** DGS: sayısal / sözel SP ağırlıkları */
  dgs?: { sayisal: number; sozel: number };
  /** TYT yaklaşık: 100 + Σ(net × katsayı) */
  tyt?: Record<string, number>;
  /** YDS: toplam soru sayısı (varsayılan 80) */
  ydsQuestionCount?: number;
}

const KPSS_GROUPS: SectionGroupDef[] = [
  { key: 'GY', sectionCodes: ['GENEL_YETENEK'], defaultMean: 30, defaultStd: 10 },
  { key: 'GK', sectionCodes: ['GENEL_KULTUR'], defaultMean: 30, defaultStd: 10 },
  { key: 'EB', sectionCodes: ['EGITIM_BILIMLERI', 'EGITIM_BILIMLERI_TESTI'], defaultMean: 30, defaultStd: 10 },
  { key: 'OABT', sectionCodes: ['OABT', 'OGRETIM_ALANI'], defaultMean: 30, defaultStd: 10 },
];

const KPSS_PROFILE: ExamScoringProfile = {
  type: 'kpss',
  primaryScoreKey: 'P3',
  sectionGroups: KPSS_GROUPS,
  kpss: {
    P1: { gy: 0.7, gk: 0.3 },
    P2: { gy: 0.6, gk: 0.4 },
    P3: { gy: 0.5, gk: 0.5 },
    P10: { gy: 0.3, gk: 0.3, eb: 0.4 },
    P121: { gy: 0.15, gk: 0.15, eb: 0.2, oabt: 0.5 },
  },
};

const ALES_PROFILE: ExamScoringProfile = {
  type: 'ales',
  primaryScoreKey: 'EA',
  sectionGroups: [
    { key: 'SAY', sectionCodes: ['SAYISAL'], defaultMean: 25, defaultStd: 8 },
    { key: 'SOZ', sectionCodes: ['SOZEL'], defaultMean: 25, defaultStd: 8 },
  ],
};

const DGS_PROFILE: ExamScoringProfile = {
  type: 'dgs',
  primaryScoreKey: 'DGS',
  sectionGroups: [
    { key: 'SAY', sectionCodes: ['SAYISAL_YETENEK'], defaultMean: 28, defaultStd: 9 },
    { key: 'SOZ', sectionCodes: ['SOZEL_YETENEK'], defaultMean: 28, defaultStd: 9 },
  ],
  dgs: { sayisal: 0.6, sozel: 0.4 },
};

const YKS_TYT_PROFILE: ExamScoringProfile = {
  type: 'yks_tyt',
  primaryScoreKey: 'TYT',
  sectionGroups: [
    { key: 'TURKCE', sectionCodes: ['TURKCE'], defaultMean: 18, defaultStd: 6 },
    { key: 'SOSYAL', sectionCodes: ['SOSYAL_BILIMLER'], defaultMean: 12, defaultStd: 5 },
    { key: 'MAT', sectionCodes: ['TEMEL_MATEMATIK'], defaultMean: 15, defaultStd: 6 },
    { key: 'FEN', sectionCodes: ['FEN_BILIMLERI'], defaultMean: 12, defaultStd: 5 },
  ],
  tyt: {
    TURKCE: 3.2,
    MAT: 3.3,
    SOSYAL: 3.0,
    FEN: 3.2,
  },
};

const YDS_PROFILE: ExamScoringProfile = {
  type: 'yds_direct',
  primaryScoreKey: 'PUAN',
  sectionGroups: [],
  ydsQuestionCount: 80,
};

/** Tek bölümlü veya basit SP profili */
function spWeightedProfile(
  groups: SectionGroupDef[],
  primaryKey: string,
): ExamScoringProfile {
  return { type: 'sp_weighted', primaryScoreKey: primaryKey, sectionGroups: groups };
}

const EXAM_PROFILES: Record<string, ExamScoringProfile> = {
  KPSS: KPSS_PROFILE,
  KPSS_ORTAOGRETIM: KPSS_PROFILE,
  KPSS_ONLISANS: KPSS_PROFILE,
  KPSS_LISANS: KPSS_PROFILE,
  ALES: ALES_PROFILE,
  DGS: DGS_PROFILE,
  YKS_TYT: YKS_TYT_PROFILE,
  YKS_AYT: spWeightedProfile(
    [{ key: 'ALAN', sectionCodes: ['MATEMATIK', 'FEN_BILIMLERI', 'TURKCE', 'SOSYAL_BILIMLER'], defaultMean: 20, defaultStd: 8 }],
    'AYT',
  ),
  YKS_YDT: YDS_PROFILE,
  E_YDS: { ...YDS_PROFILE, ydsQuestionCount: 80 },
  YOKDIL: { ...YDS_PROFILE, ydsQuestionCount: 80 },
};

export function getExamScoringProfile(examCode: string): ExamScoringProfile {
  if (EXAM_PROFILES[examCode]) return EXAM_PROFILES[examCode];
  if (examCode.startsWith('KPSS')) return KPSS_PROFILE;
  if (examCode.startsWith('YKS')) {
    if (examCode.includes('TYT')) return YKS_TYT_PROFILE;
    if (examCode.includes('YDT')) return YDS_PROFILE;
    return EXAM_PROFILES.YKS_AYT;
  }
  return {
    type: 'net_ratio',
    primaryScoreKey: 'PUAN',
    sectionGroups: [],
  };
}

export function isKpssExamCode(examCode: string): boolean {
  return examCode === 'KPSS' || examCode.startsWith('KPSS_');
}
