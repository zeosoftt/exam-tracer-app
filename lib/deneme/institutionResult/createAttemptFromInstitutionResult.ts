import { computeDenemeScores } from '@/lib/deneme/computeDenemeScores';
import {
  createDenemeAttempt,
  findActiveExamById,
  findExamSubjectsByExamId,
  findExamTopicsByExamId,
  mapDenemeAttemptToDto,
} from '@/lib/deneme/denemeRepository';
import { fetchInstitutionResult } from '@/lib/deneme/institutionResult/fetchInstitutionResult';
import { mapInstitutionSubjectsToBreakdown } from '@/lib/deneme/institutionResult/mapToDenemeBreakdown';
import { mapInstitutionTopicsToBreakdown } from '@/lib/deneme/analysis/matchTopics';
import type { InstitutionResultImport } from '@/lib/deneme/institutionResult/types';
import { prisma } from '@/lib/db/prisma';

function buildImportNotes(importData: InstitutionResultImport): string {
  const lines = [
    `Kurum sonucu: ${importData.sourceUrl}`,
    importData.institution ? `Kurum: ${importData.institution}` : null,
    importData.examNumber ? `Deneme no: ${importData.examNumber}` : null,
    `Kaynak: ${importData.sourceHost}`,
  ].filter(Boolean);
  return lines.join('\n');
}

async function assertNotDuplicateImport(userId: string, sourceUrl: string): Promise<void> {
  const existing = await prisma.examAttempt.findFirst({
    where: {
      userId,
      deletedAt: null,
      notes: { contains: sourceUrl },
    },
    select: { id: true },
  });

  if (existing) {
    throw new Error('Bu sonuç linki zaten deneme kaydı olarak eklenmiş.');
  }
}

export async function createAttemptFromInstitutionResult(input: {
  userId: string;
  examId: string;
  sourceUrl: string;
}): Promise<ReturnType<typeof mapDenemeAttemptToDto>> {
  const exam = await findActiveExamById(input.examId);
  if (!exam) {
    throw new Error('Sınav bulunamadı veya aktif değil.');
  }

  const importData = await fetchInstitutionResult(input.sourceUrl);
  await assertNotDuplicateImport(input.userId, importData.sourceUrl);

  const examSubjects = await findExamSubjectsByExamId(input.examId);
  if (examSubjects.length === 0) {
    throw new Error('Seçilen sınavın ders yapısı bulunamadı.');
  }

  const examTopics = await findExamTopicsByExamId(input.examId);
  const topicBreakdown =
    importData.topics.length > 0
      ? mapInstitutionTopicsToBreakdown(
          importData.topics,
          examTopics.map((topic) => ({
            id: topic.id,
            name: topic.name,
            subjectId: topic.subject.id,
            subjectName: topic.subject.name,
          })),
        )
      : [];

  const { breakdown, unmatchedInstitutionSubjects } = mapInstitutionSubjectsToBreakdown(
    importData.subjects,
    examSubjects,
  );

  const hasAnyAnswer = breakdown.some((item) => item.right > 0 || item.wrong > 0 || item.empty > 0);
  if (!hasAnyAnswer) {
    throw new Error('Kurum sonucundaki dersler seçilen sınav yapısıyla eşleşmedi.');
  }

  const scores = await computeDenemeScores({
    examId: input.examId,
    examCode: exam.code,
    rightCount: importData.totals.right,
    wrongCount: importData.totals.wrong,
    emptyCount: importData.totals.empty,
    netScore: importData.totals.net,
    breakdown,
  });

  const notesParts = [buildImportNotes(importData)];
  if (unmatchedInstitutionSubjects.length > 0) {
    notesParts.push(`Eşleşmeyen dersler: ${unmatchedInstitutionSubjects.join(', ')}`);
  }
  const notes = notesParts.join('\n').slice(0, 2000);

  const attemptedAt = importData.examDate ? new Date(`${importData.examDate}T12:00:00`) : new Date();

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
