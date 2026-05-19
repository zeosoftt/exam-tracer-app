import type { z } from 'zod';
import type { createExamSchema } from '@/lib/validation/schemas';
import { fetchApiData, mutateApi } from '@/lib/client-api/http';

export type CreateExamInput = z.infer<typeof createExamSchema>;

export type CreateExamResult =
  | { ok: true; examId: string }
  | { ok: false; message: string };

export type ExamListItem = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
};

export async function createExamRequest(body: CreateExamInput): Promise<CreateExamResult> {
  const { ok, data, result } = await mutateApi<CreateExamInput, { id: string }>(
    '/api/exams',
    'POST',
    body,
  );
  if (!ok) {
    return { ok: false, message: result.error?.message || 'Sınav oluşturulurken bir hata oluştu' };
  }
  if (!data?.id) {
    return { ok: false, message: 'Sunucu yanıtı geçersiz.' };
  }
  return { ok: true, examId: data.id };
}

export async function fetchExamsList(): Promise<ExamListItem[]> {
  const result = await fetchApiData<ExamListItem[]>('/api/exams');
  if (!result.ok) {
    throw new Error('Failed to fetch exams');
  }
  return result.data;
}
