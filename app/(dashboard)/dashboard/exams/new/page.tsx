/**
 * Create Exam Page
 * Form to create a new exam
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { CreateExamForm } from '@/components/exams/CreateExamForm';

export default async function NewExamPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Check if user has permission to create exams
  const canCreate = session.user.role === 'ADMIN' || session.user.role === 'INSTITUTION_ADMIN';

  if (!canCreate) {
    redirect('/dashboard/exams');
  }

  return <CreateExamForm user={session.user} />;
}
