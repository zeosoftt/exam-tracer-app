/**
 * Exams List Page
 */

import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const ExamsList = dynamic(
  () => import('@/components/exams/ExamsList').then((m) => m.ExamsList),
  { loading: () => <RouteShellSkeleton /> },
);

export default async function ExamsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return <ExamsList user={session.user} />;
}
