/**
 * Kurulum sihirbazı: konu preset’i → işaretlenecek topicId listesi + önizleme satırları.
 * API ve istemci aynı sırayı kullanmalı.
 */

/** Ders başına alınacak konu sayısı — UI metinleri ve API aynı kaynağı kullanmalı. */
export const SETUP_WIZARD_TOPICS_PER_SUBJECT = {
  starter: 5,
  solid: 10,
} as const;

/** Önizleme kartında konu adı satırı üst sınırı (kalan “… ve N konu daha” ile kısaltılır). */
const PREVIEW_TOPIC_NAME_LINES = 5;

export type SetupWizardExamInput = {
  sections: Array<{
    subjects: Array<{
      name: string;
      topics: Array<{ id: string; name: string }>;
    }>;
  }>;
};

export type SetupWizardTopicPlan = {
  topicIds: string[];
  /** Önizleme kartları */
  previewSections: Array<{ heading: string; lines: string[] }>;
};

/** Sınavdaki toplam konu sayısı (yüzde hesapları için) */
export function countTopicsInExam(exam: SetupWizardExamInput): number {
  return exam.sections.reduce(
    (acc, sec) => acc + sec.subjects.reduce((sacc, sub) => sacc + sub.topics.length, 0),
    0,
  );
}

type SubjectRow = SetupWizardExamInput['sections'][number]['subjects'][number];

function countChosenTopics(subjectsOrdered: SubjectRow[], limitPerSubject: number): number {
  let n = 0;
  for (const sub of subjectsOrdered) {
    n += Math.min(sub.topics.length, limitPerSubject);
  }
  return n;
}

/** Her dersten sırayla en fazla `limitPerSubject` konu (API + istemci aynı sıra). */
function computePerSubjectTopicPlan(
  subjectsOrdered: SubjectRow[],
  limitPerSubject: number,
): SetupWizardTopicPlan {
  const totalChosen = countChosenTopics(subjectsOrdered, limitPerSubject);
  const topicIds: string[] = totalChosen > 0 ? new Array<string>(totalChosen) : [];
  const previewSections: Array<{ heading: string; lines: string[] }> = [];
  let writeAt = 0;

  for (const sub of subjectsOrdered) {
    const take = sub.topics.slice(0, limitPerSubject);
    for (const t of take) {
      topicIds[writeAt++] = t.id;
    }
    const n = take.length;
    const lines: string[] =
      n === 0
        ? ['Bu derste konu tanımı yok']
        : take
            .slice(0, PREVIEW_TOPIC_NAME_LINES)
            .map((t) => t.name)
            .concat(n > PREVIEW_TOPIC_NAME_LINES ? [`… ve ${n - PREVIEW_TOPIC_NAME_LINES} konu daha`] : []);
    previewSections.push({
      heading: `${sub.name} — tamamlanacak: ${n} konu`,
      lines,
    });
  }
  return { topicIds, previewSections };
}

export function computeSetupWizardTopicPlan(
  preset: 'none' | 'starter' | 'solid',
  exam: SetupWizardExamInput,
): SetupWizardTopicPlan {
  if (preset === 'none') {
    return { topicIds: [], previewSections: [] };
  }

  const subjectsOrdered = exam.sections.flatMap((sec) => sec.subjects);

  if (preset === 'starter') {
    return computePerSubjectTopicPlan(subjectsOrdered, SETUP_WIZARD_TOPICS_PER_SUBJECT.starter);
  }

  return computePerSubjectTopicPlan(subjectsOrdered, SETUP_WIZARD_TOPICS_PER_SUBJECT.solid);
}
