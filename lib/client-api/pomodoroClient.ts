/**
 * Pomodoro session API (history + stats, start, complete).
 */

export interface PomodoroSession {
  id: string;
  duration: number;
  isBreak: boolean;
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
}

export interface PomodoroStats {
  totalSessions: number;
  totalStudyHours: number;
  todaySessions: number;
  todayStudyHours: number;
  weekSessions: number;
  weekStudyHours: number;
}

export async function fetchPomodoroDashboard(): Promise<
  | { ok: true; sessions: PomodoroSession[]; stats: PomodoroStats | null }
  | { ok: false; premiumRequired?: boolean }
> {
  const response = await fetch('/api/pomodoro?limit=10&page=1');
  if (response.ok) {
    const data = await response.json();
    return {
      ok: true,
      sessions: data.data?.sessions || [],
      stats: data.data?.stats || null,
    };
  }
  if (response.status === 403) {
    const body = await response.json().catch(() => ({}));
    if ((body as { code?: string }).code === 'PREMIUM_REQUIRED') {
      return { ok: false, premiumRequired: true };
    }
  }
  return { ok: false };
}

export async function startPomodoroSession(body: {
  duration: number;
  isBreak: boolean;
}): Promise<{ ok: boolean; sessionId?: string }> {
  const response = await fetch('/api/pomodoro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) return { ok: false };
  const data = await response.json();
  const id = data.data?.id as string | undefined;
  if (!id) return { ok: false };
  return { ok: true, sessionId: id };
}

export async function completePomodoroSession(sessionId: string): Promise<boolean> {
  const response = await fetch(`/api/pomodoro/${sessionId}`, { method: 'PATCH' });
  return response.ok;
}
