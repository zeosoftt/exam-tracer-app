/**
 * Pomodoro session API (history + stats, start, complete).
 */

import { fetchApiData, fetchJson, jsonInit } from '@/lib/client-api/http';

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
  totalStudyMinutes: number;
  totalStudyHours: number;
  todaySessions: number;
  todayStudyMinutes: number;
  todayStudyHours: number;
  weekSessions: number;
  weekStudyMinutes: number;
  weekStudyHours: number;
}

type PomodoroDashboardData = {
  sessions?: PomodoroSession[];
  stats?: PomodoroStats | null;
};

export async function fetchPomodoroDashboard(): Promise<
  | { ok: true; sessions: PomodoroSession[]; stats: PomodoroStats | null }
  | { ok: false }
> {
  const result = await fetchApiData<PomodoroDashboardData>('/api/pomodoro?limit=10&page=1');
  if (!result.ok) return { ok: false };
  return {
    ok: true,
    sessions: result.data.sessions ?? [],
    stats: result.data.stats ?? null,
  };
}

export async function startPomodoroSession(body: {
  duration: number;
  isBreak: boolean;
}): Promise<{ ok: boolean; sessionId?: string }> {
  const { ok, body: data } = await fetchJson<{ success?: boolean; data?: { id?: string } }>(
    '/api/pomodoro',
    jsonInit('POST', body),
  );
  if (!ok || !data.success) return { ok: false };
  const id = data.data?.id;
  if (!id) return { ok: false };
  return { ok: true, sessionId: id };
}

export async function completePomodoroSession(sessionId: string): Promise<boolean> {
  const { ok } = await fetchJson(`/api/pomodoro/${sessionId}`, jsonInit('PATCH'));
  return ok;
}
