/**
 * Create Exam Page
 * Form to create a new exam
 */

import dynamic from 'next/dynamic';
import { requireExamCreatorPageSession } from '@/lib/auth/pageSession';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const CreateExamForm = dynamic(
  () => import('@/components/exams/CreateExamForm').then((m) => m.CreateExamForm),
  { loading: () => <RouteShellSkeleton /> },
);

export default async function NewExamPage() {
  const session = await requireExamCreatorPageSession();

  return <CreateExamForm user={session.user} />;
}
