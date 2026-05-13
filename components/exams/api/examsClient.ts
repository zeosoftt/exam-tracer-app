import type { z } from 'zod';
import type { createExamSchema } from '@/lib/validation/schemas';

export type CreateExamInput = z.infer<typeof createExamSchema>;

export type CreateExamResult =
  | { ok: true; examId: string }
  | { ok: false; message: string };

export async function createExamRequest(body: CreateExamInput): Promise<CreateExamResult> {
  const response = await fetch('/api/exams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = (await response.json()) as { data?: { id: string }; error?: { message?: string } };
  if (!response.ok) {
    return { ok: false, message: result.error?.message || 'Sınav oluşturulurken bir hata oluştu' };
  }
  if (!result.data?.id) {
    return { ok: false, message: 'Sunucu yanıtı geçersiz.' };
  }
  return { ok: true, examId: result.data.id };
}

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

export async function fetchExamsList(): Promise<ExamListItem[]> {
  const response = await fetch('/api/exams');
  if (!response.ok) {
    throw new Error('Failed to fetch exams');
  }
  const data = (await response.json()) as { data?: ExamListItem[] };
  return data.data || [];
}
