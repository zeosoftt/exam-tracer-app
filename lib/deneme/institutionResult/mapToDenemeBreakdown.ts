import type { DenemeBreakdownItem } from '@/lib/deneme/computeDenemeScores';
import type { InstitutionSubjectResult } from '@/lib/deneme/institutionResult/types';
import { institutionSubjectLookupKeys, normalizeSubjectName } from '@/lib/deneme/institutionResult/normalizeSubjectName';

export type ExamSubjectRow = { id: string; name: string };

export type MapBreakdownResult = {
  breakdown: DenemeBreakdownItem[];
  unmatchedInstitutionSubjects: string[];
};

export function mapInstitutionSubjectsToBreakdown(
  institutionSubjects: InstitutionSubjectResult[],
  examSubjects: ExamSubjectRow[],
): MapBreakdownResult {
  const institutionByKey = new Map<string, InstitutionSubjectResult>();
  for (const subject of institutionSubjects) {
    for (const key of institutionSubjectLookupKeys(subject.name)) {
      institutionByKey.set(key, subject);
    }
  }

  const matchedInstitutionKeys = new Set<string>();

  const breakdown = examSubjects.map((examSubject) => {
    const examKey = normalizeSubjectName(examSubject.name);
    const imported = institutionByKey.get(examKey);

    if (imported) {
      matchedInstitutionKeys.add(normalizeSubjectName(imported.name));
    }

    return {
      subjectId: examSubject.id,
      subjectName: examSubject.name,
      right: imported?.right ?? 0,
      wrong: imported?.wrong ?? 0,
      empty: imported?.empty ?? 0,
    };
  });

  const unmatchedInstitutionSubjects = institutionSubjects
    .map((s) => s.name)
    .filter((name) => !matchedInstitutionKeys.has(normalizeSubjectName(name)));

  return { breakdown, unmatchedInstitutionSubjects };
}
