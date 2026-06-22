export type InstitutionSubjectResult = {
  name: string;
  questionCount: number;
  right: number;
  wrong: number;
  empty: number;
  net: number;
};

export type InstitutionSectionTotal = {
  right: number;
  wrong: number;
  net: number;
  questionCount: number;
};

export type InstitutionScoreResult = {
  type: string;
  score: number;
  rankKurum: number | null;
  rankNational: number | null;
};

export type InstitutionTopicResult = {
  subjectName: string;
  topicName: string;
  questionCount: number;
  right: number;
  wrong: number;
  empty: number;
  successRate: number;
};

/** Verisayar tabanlı kurum sonuç sayfasından okunan veri */
export type InstitutionResultImport = {
  sourceUrl: string;
  sourceHost: string;
  platform: 'verisayar' | 'unknown';
  examName: string;
  examDate: string | null;
  examNumber: string | null;
  institution: string | null;
  studentName: string | null;
  subjects: InstitutionSubjectResult[];
  sectionTotals: {
    generalAbility: InstitutionSectionTotal | null;
    generalCulture: InstitutionSectionTotal | null;
  };
  scores: InstitutionScoreResult[];
  topics: InstitutionTopicResult[];
  totals: {
    right: number;
    wrong: number;
    empty: number;
    net: number;
    questionCount: number;
  };
};

/** @deprecated Kurum sonuç import alias */
export type PegemImportResult = InstitutionResultImport;
