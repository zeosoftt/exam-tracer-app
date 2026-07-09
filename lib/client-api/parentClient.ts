import type { LinkedStudentSummary } from '@/lib/parent/listLinkedStudents';
import { fetchApiData } from '@/lib/client-api/http';

export async function fetchParentChildren(): Promise<LinkedStudentSummary[]> {
  const result = await fetchApiData<{ students: LinkedStudentSummary[] }>('/api/parent/children');
  return result.ok && result.data?.students ? result.data.students : [];
}
