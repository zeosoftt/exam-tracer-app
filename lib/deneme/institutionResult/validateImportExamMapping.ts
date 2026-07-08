import { mapInstitutionSubjectsToBreakdown } from '@/lib/deneme/institutionResult/mapToDenemeBreakdown';
import type { InstitutionResultImport } from '@/lib/deneme/institutionResult/types';

export type ExamSubjectRow = { id: string; name: string };

export function validateImportExamMapping(
  importData: InstitutionResultImport,
  examSubjects: ExamSubjectRow[],
): { ok: true } | { ok: false; message: string } {
  if (examSubjects.length === 0) {
    return { ok: false, message: 'Seçilen sınavın ders yapısı bulunamadı.' };
  }

  const { breakdown, unmatchedInstitutionSubjects } = mapInstitutionSubjectsToBreakdown(
    importData.subjects,
    examSubjects,
  );

  const hasAnyAnswer = breakdown.some((item) => item.right > 0 || item.wrong > 0 || item.empty > 0);
  if (!hasAnyAnswer) {
    const institutionNames = importData.subjects.map((subject) => subject.name).join(', ');
    return {
      ok: false,
      message: `Kurum sonucundaki dersler seçilen sınav yapısıyla eşleşmedi. Kurum dersleri: ${institutionNames || '—'}. Doğru sınavı seçin.`,
    };
  }

  if (unmatchedInstitutionSubjects.length > 0 && importData.subjects.length === unmatchedInstitutionSubjects.length) {
    return {
      ok: false,
      message: 'Hiçbir kurum dersi seçilen sınav yapısıyla eşleşmedi. Lütfen doğru sınavı seçin.',
    };
  }

  return { ok: true };
}
