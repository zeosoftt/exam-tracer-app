/**
 * Exams List Page
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { ExamsList } from '@/components/exams/ExamsList';

export default async function ExamsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return <ExamsList user={session.user} />;
}
