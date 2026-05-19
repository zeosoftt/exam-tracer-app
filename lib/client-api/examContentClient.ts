import type { EntityType, ExamContentModal, ExamNode } from '@/components/super-admin/domain/examContentTypes';
import { fetchApiData, fetchJson, getApiErrorMessage, jsonInit, type ApiEnvelope } from '@/lib/client-api/http';

export async function fetchExamContentTree(): Promise<ExamNode[]> {
  const result = await fetchApiData<{ exams?: ExamNode[] }>('/api/super-admin/exam-content');
  if (!result.ok) {
    throw new Error(result.message || 'Yüklenemedi');
  }
  return result.data.exams ?? [];
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
          typeof form.examQuestionCount === 'number'
            ? form.examQuestionCount
            : parseInt(String(form.examQuestionCount), 10) || null;
      }
    }
    const { ok, status, body: result } = await fetchJson<ApiEnvelope<unknown>>(url, jsonInit('PATCH', body));
    if (!ok) throw new Error(getApiErrorMessage(result, `Kaydedilemedi (HTTP ${status})`));
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
  const { ok, status, body: result } = await fetchJson<ApiEnvelope<unknown>>(url, jsonInit('POST', body));
  if (!ok) throw new Error(getApiErrorMessage(result, `Kaydedilemedi (HTTP ${status})`));
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
  const { ok, status, body } = await fetchJson<ApiEnvelope<unknown>>(url, jsonInit('DELETE'));
  if (!ok) throw new Error(getApiErrorMessage(body, `Silinemedi (HTTP ${status})`));
}

export async function patchTopicOrder(topicId: string, order: number): Promise<void> {
  const { ok, status, body } = await fetchJson<ApiEnvelope<unknown>>(
    `/api/super-admin/exam-content/topics/${topicId}`,
    jsonInit('PATCH', { order }),
  );
  if (!ok) throw new Error(getApiErrorMessage(body, `Güncellenemedi (HTTP ${status})`));
}
