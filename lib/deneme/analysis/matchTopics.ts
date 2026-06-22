import { normalizeSubjectName } from '@/lib/deneme/institutionResult/normalizeSubjectName';
import type { InstitutionTopicResult } from '@/lib/deneme/institutionResult/types';
import type { DenemeTopicBreakdownItem } from '@/lib/deneme/analysis/types';

export type ExamTopicRow = {
  id: string;
  name: string;
  subjectId: string;
  subjectName: string;
};

function normalizeTopicName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('tr-TR');
}

function topicLookupKeys(name: string): string[] {
  const normalized = normalizeTopicName(name);
  return [normalized, normalized.replace(/ı/g, 'i')];
}

export function mapInstitutionTopicsToBreakdown(
  institutionTopics: InstitutionTopicResult[],
  examTopics: ExamTopicRow[],
): DenemeTopicBreakdownItem[] {
  const byKey = new Map<string, ExamTopicRow>();
  for (const topic of examTopics) {
    for (const key of topicLookupKeys(topic.name)) {
      byKey.set(key, topic);
    }
  }

  const bySubject = new Map<string, ExamTopicRow[]>();
  for (const topic of examTopics) {
    const subjectKey = normalizeSubjectName(topic.subjectName);
    const list = bySubject.get(subjectKey) ?? [];
    list.push(topic);
    bySubject.set(subjectKey, list);
  }

  return institutionTopics.map((row) => {
    let matched: ExamTopicRow | undefined;
    for (const key of topicLookupKeys(row.topicName)) {
      matched = byKey.get(key);
      if (matched) break;
    }

    if (!matched) {
      const subjectTopics = bySubject.get(normalizeSubjectName(row.subjectName)) ?? [];
      matched = subjectTopics.find((candidate) => {
        const candidateNorm = normalizeTopicName(candidate.name);
        const rowNorm = normalizeTopicName(row.topicName);
        return candidateNorm.includes(rowNorm) || rowNorm.includes(candidateNorm);
      });
    }

    return {
      topicId: matched?.id ?? null,
      topicName: row.topicName,
      subjectId: matched?.subjectId ?? null,
      subjectName: row.subjectName,
      questionCount: row.questionCount,
      right: row.right,
      wrong: row.wrong,
      empty: row.empty,
      successRate: row.successRate,
      matched: Boolean(matched),
    };
  });
}
