/**
 * Create Exam Page
 * Form to create a new exam
 */

import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const CreateExamForm = dynamic(
  () => import('@/components/exams/CreateExamForm').then((m) => m.CreateExamForm),
  { loading: () => <RouteShellSkeleton /> },
);

export default async function NewExamPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  const canCreate = session.user.role === 'ADMIN' || session.user.role === 'INSTITUTION_ADMIN';

  if (!canCreate) {
    redirect('/dashboard/exams');
  }

  return <CreateExamForm user={session.user} />;
}
