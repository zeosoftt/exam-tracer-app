/**
 * Exams List Page
 */

import dynamic from 'next/dynamic';
import { requirePageSession } from '@/lib/auth/pageSession';
import { RouteShellSkeleton } from '@/components/ui/RouteShellSkeleton';

const ExamsList = dynamic(
  () => import('@/components/exams/ExamsList').then((m) => m.ExamsList),
  { loading: () => <RouteShellSkeleton /> },
);

export default async function ExamsPage() {
  const session = await requirePageSession();

  return <ExamsList user={session.user} />;
}
