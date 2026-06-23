'use server';

import { revalidatePath } from 'next/cache';
import { requirePageSession } from '@/lib/auth/pageSession';
import { softDeleteUserDenemeAttempt } from '@/lib/deneme/denemeRepository';

export async function deleteDenemeAttemptAction(attemptId: string): Promise<{ ok: boolean }> {
  const session = await requirePageSession();
  const ok = await softDeleteUserDenemeAttempt(session.user.id, attemptId);
  if (ok) {
    revalidatePath('/dashboard/deneme');
  }
  return { ok };
}
