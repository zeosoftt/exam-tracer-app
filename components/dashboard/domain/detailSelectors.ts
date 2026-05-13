import type { DetailData, Section, Subject } from '../detail/dashboardDetailTypes';

export function selectSection(detail: DetailData | null, sectionId: string | null): Section | null {
  if (!detail?.sections?.length || !sectionId) return null;
  return detail.sections.find((s) => s.id === sectionId) ?? null;
}

export function selectSubject(section: Section | null, subjectId: string | null): Subject | null {
  if (!section?.subjects?.length || !subjectId) return null;
  return section.subjects.find((s) => s.id === subjectId) ?? null;
}
