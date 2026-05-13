import type { EntityType, ExamContentModal, ExamNode } from '../domain/examContentTypes';

async function parseError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error || `HTTP ${res.status}`;
}

export async function fetchExamContentTree(): Promise<ExamNode[]> {
  const res = await fetch('/api/super-admin/exam-content');
  const data = (await res.json().catch(() => ({}))) as { data?: { exams?: ExamNode[] }; error?: string };
  if (!res.ok) throw new Error(data.error || 'Yüklenemedi');
  return data.data?.exams ?? [];
}

export async function persistExamContentModal(
  modal: NonNullable<ExamContentModal>,
  form: Record<string, string | number | null>,
): Promise<void> {
  if (modal.edit) {
    const id = (modal.edit as { id: string }).id;
    const url =
      modal.type === 'exam'
        ? `/api/super-admin/exam-content/exams/${id}`
        : modal.type === 'section'
          ? `/api/super-admin/exam-content/sections/${id}`
          : modal.type === 'subject'
            ? `/api/super-admin/exam-content/subjects/${id}`
            : `/api/super-admin/exam-content/topics/${id}`;
    const body: Record<string, unknown> = {};
    if (modal.type === 'exam') {
      body.name = form.name;
      body.code = form.code;
      body.description = form.description || null;
      if (form.status) body.status = form.status;
      body.startDate = form.startDate && String(form.startDate).trim() ? String(form.startDate).trim() : null;
    } else {
      body.name = form.name;
      body.code = form.code;
      body.description = form.description || null;
      body.order = typeof form.order === 'number' ? form.order : 0;
      if (modal.type === 'topic' && form.examQuestionCount !== '' && form.examQuestionCount !== undefined) {
        body.examQuestionCount =
          typeof form.examQuestionCount === 'number' ? form.examQuestionCount : parseInt(String(form.examQuestionCount), 10) || null;
      }
    }
    const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(await parseError(res));
    return;
  }

  const url =
    modal.type === 'exam'
      ? '/api/super-admin/exam-content/exams'
      : modal.type === 'section'
        ? '/api/super-admin/exam-content/sections'
        : modal.type === 'subject'
          ? '/api/super-admin/exam-content/subjects'
          : '/api/super-admin/exam-content/topics';
  const body: Record<string, unknown> = {
    name: form.name,
    code: form.code,
    description: form.description || null,
    order: typeof form.order === 'number' ? form.order : 0,
  };
  if (modal.type === 'exam') {
    body.status = form.status || 'ACTIVE';
    body.startDate = form.startDate && String(form.startDate).trim() ? String(form.startDate).trim() : null;
  } else if (modal.type === 'section') {
    body.examId = modal.parentId;
  } else if (modal.type === 'subject') {
    body.sectionId = modal.parentId;
  } else if (modal.type === 'topic') {
    body.subjectId = modal.parentId;
    body.examQuestionCount =
      form.examQuestionCount !== '' && form.examQuestionCount !== undefined
        ? typeof form.examQuestionCount === 'number'
          ? form.examQuestionCount
          : parseInt(String(form.examQuestionCount), 10)
        : null;
  }
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function deleteExamContentEntity(type: EntityType, id: string): Promise<void> {
  const url =
    type === 'exam'
      ? `/api/super-admin/exam-content/exams/${id}`
      : type === 'section'
        ? `/api/super-admin/exam-content/sections/${id}`
        : type === 'subject'
          ? `/api/super-admin/exam-content/subjects/${id}`
          : `/api/super-admin/exam-content/topics/${id}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function patchTopicOrder(topicId: string, order: number): Promise<void> {
  const res = await fetch(`/api/super-admin/exam-content/topics/${topicId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}
