import type { SetupWizardExamInput } from '@/lib/setup-wizard/topicPresetSelection';

/** GET /api/exams/[id] yanıtından preset hesaplaması için ağaç */
export function mapExamApiDataToWizardInput(data: unknown): SetupWizardExamInput | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as { sections?: unknown };
  if (!Array.isArray(d.sections)) return null;
  return {
    sections: d.sections.map((sec: unknown) => {
      const s = sec as { subjects?: unknown };
      const subjects = Array.isArray(s.subjects)
        ? s.subjects.map((sub: unknown) => {
            const su = sub as { name?: unknown; topics?: unknown };
            const topics = Array.isArray(su.topics)
              ? su.topics.map((t: unknown) => {
                  const top = t as { id?: unknown; name?: unknown };
                  return { id: String(top.id ?? ''), name: String(top.name ?? '') };
                })
              : [];
            return { name: String(su.name ?? ''), topics };
          })
        : [];
      return { subjects };
    }),
  };
}
