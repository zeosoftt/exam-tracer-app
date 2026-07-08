import { computeDenemeScores } from '@/lib/deneme/computeDenemeScores';
import {
  createDenemeAttempt,
  findActiveExamById,
  findExamSubjectsByExamId,
  findExamTopicsByExamId,
  mapDenemeAttemptToDto,
} from '@/lib/deneme/denemeRepository';
import { fetchInstitutionResult } from '@/lib/deneme/institutionResult/fetchInstitutionResult';
import { assertNotDuplicateImport, buildImportNotes } from '@/lib/deneme/institutionResult/duplicateImport';
import { mapInstitutionSubjectsToBreakdown } from '@/lib/deneme/institutionResult/mapToDenemeBreakdown';
import { mapInstitutionTopicsToBreakdown } from '@/lib/deneme/analysis/matchTopics';
import { normalizeInstitutionSourceUrl } from '@/lib/deneme/institutionResult/normalizeSourceUrl';
import { pickInstitutionScoreForExam } from '@/lib/deneme/institutionResult/pickInstitutionScore';
import type { InstitutionResultImport } from '@/lib/deneme/institutionResult/types';
import { validateImportExamMapping } from '@/lib/deneme/institutionResult/validateImportExamMapping';

function assertImportMatchesSourceUrl(importData: InstitutionResultImport, sourceUrl: string): void {
  const normalizedInput = normalizeInstitutionSourceUrl(sourceUrl);
  const normalizedImport = normalizeInstitutionSourceUrl(importData.sourceUrl);
  if (normalizedInput !== normalizedImport) {
    throw new Error('Önizleme verisi ile kayıt linki uyuşmuyor. Lütfen sonucu yeniden getirin.');
  }
}

export async function createAttemptFromInstitutionImport(input: {
  userId: string;
  examId: string;
  importData: InstitutionResultImport;
}): Promise<ReturnType<typeof mapDenemeAttemptToDto>> {
  const exam = await findActiveExamById(input.examId);
  if (!exam) {
    throw new Error('Sınav bulunamadı veya aktif değil.');
  }

  await assertNotDuplicateImport(input.userId, input.importData);

  const examSubjects = await findExamSubjectsByExamId(input.examId);
  const mapping = validateImportExamMapping(input.importData, examSubjects);
  if (!mapping.ok) {
    throw new Error(mapping.message);
  }

  const { breakdown, unmatchedInstitutionSubjects } = mapInstitutionSubjectsToBreakdown(
    input.importData.subjects,
    examSubjects,
  );

  const examTopics = await findExamTopicsByExamId(input.examId);
  const topicBreakdown =
    input.importData.topics.length > 0
      ? mapInstitutionTopicsToBreakdown(
          input.importData.topics,
          examTopics.map((topic) => ({
            id: topic.id,
            name: topic.name,
            subjectId: topic.subject.id,
            subjectName: topic.subject.name,
          })),
        )
      : [];

  const institutionTotalScore = pickInstitutionScoreForExam(input.importData.scores, exam.code);

  const scores = await computeDenemeScores({
    examId: input.examId,
    examCode: exam.code,
    totalScore: institutionTotalScore,
    rightCount: input.importData.totals.right,
    wrongCount: input.importData.totals.wrong,
    emptyCount: input.importData.totals.empty,
    netScore: input.importData.totals.net,
    breakdown,
  });

  const notesParts = [buildImportNotes(input.importData)];
  if (unmatchedInstitutionSubjects.length > 0) {
    notesParts.push(`Eşleşmeyen dersler: ${unmatchedInstitutionSubjects.join(', ')}`);
  }
  const notes = notesParts.join('\n').slice(0, 2000);

  const attemptedAt = input.importData.examDate
    ? new Date(`${input.importData.examDate}T12:00:00`)
    : new Date();

  const createData: Parameters<typeof createDenemeAttempt>[0] = {
    userId: input.userId,
    examId: input.examId,
    attemptedAt,
    status: 'COMPLETED',
    notes,
  };

  if (scores.finalTotalScore != null && Number.isFinite(scores.finalTotalScore)) {
    createData.totalScore = scores.finalTotalScore;
  }
  if (scores.finalNetScore != null && Number.isFinite(scores.finalNetScore)) {
    createData.netScore = scores.finalNetScore;
  }
  if (scores.finalRightCount != null) createData.rightCount = scores.finalRightCount;
  if (scores.finalWrongCount != null) createData.wrongCount = scores.finalWrongCount;
  if (scores.finalEmptyCount != null) createData.emptyCount = scores.finalEmptyCount;
  if (scores.breakdownJson != null) createData.breakdown = scores.breakdownJson as object;
  if (topicBreakdown.length > 0) createData.topicBreakdown = topicBreakdown as object;

  const attempt = await createDenemeAttempt(createData);
  return mapDenemeAttemptToDto(attempt);
}

export async function createAttemptFromInstitutionResult(input: {
  userId: string;
  examId: string;
  sourceUrl: string;
  importData?: InstitutionResultImport;
}): Promise<ReturnType<typeof mapDenemeAttemptToDto>> {
  const importData = input.importData ?? (await fetchInstitutionResult(input.sourceUrl));
  assertImportMatchesSourceUrl(importData, input.sourceUrl);

  return createAttemptFromInstitutionImport({
    userId: input.userId,
    examId: input.examId,
    importData,
  });
}
