export type ExamOption = { id: string; name: string; code: string };

export type SubjectRow = {
  id: string;
  name: string;
  code: string;
  sectionName?: string;
};

export type SubjectInput = {
  right: number;
  wrong: number;
  empty: number;
};

export type DenemeFormState = {
  examId: string;
  attemptedAt: string;
  durationMinutes: string;
  notes: string;
  simpleRight: string;
  simpleWrong: string;
  simpleEmpty: string;
};

export function createInitialDenemeForm(): DenemeFormState {
  return {
    examId: '',
    attemptedAt: new Date().toISOString().slice(0, 16),
    durationMinutes: '',
    notes: '',
    simpleRight: '',
    simpleWrong: '',
    simpleEmpty: '',
  };
}
