import { CheckCircle2, CircleDashed, Coffee, History, Timer } from 'lucide-react';
import {
  formatRelativeSessionDate,
  formatSessionDuration,
  groupSessionsByDay,
} from '@/lib/pomodoro/pomodoroDisplay';

export interface PomodoroHistorySession {
  id: string;
  duration: number;
  isBreak: boolean;
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
}

function SessionStatusBadge({ completed }: { completed: boolean }) {
  if (completed) {
    return (
      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-800 dark:bg-green-950/50 dark:text-green-300">
        <CheckCircle2 className="h-2.5 w-2.5" aria-hidden />
        Bitti
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-stone-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600 dark:bg-stone-700 dark:text-stone-300">
      <CircleDashed className="h-2.5 w-2.5" aria-hidden />
      Yarım
    </span>
  );
}

function SessionRow({ session }: { session: PomodoroHistorySession }) {
  const isBreak = session.isBreak;
  const Icon = isBreak ? Coffee : Timer;

  return (
    <li
      className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 ${
        session.completed
          ? isBreak
            ? 'border-pink-200/80 bg-pink-50/50 dark:border-pink-900/40 dark:bg-pink-950/20'
            : 'border-primary-200/80 bg-primary-50/50 dark:border-primary-900/40 dark:bg-primary-950/20'
          : 'border-stone-200 bg-stone-50/80 dark:border-stone-700 dark:bg-stone-800/40'
      }`}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
          isBreak
            ? 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300'
            : 'bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300'
        }`}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs font-semibold text-stone-900 dark:text-stone-100">
            {isBreak ? 'Mola' : 'Çalışma'}
          </span>
          <span className="shrink-0 text-[11px] tabular-nums text-stone-500 dark:text-stone-400">
            {formatSessionDuration(session.duration)}
          </span>
        </div>
        <p className="truncate text-[11px] text-stone-500 dark:text-stone-400">
          {formatRelativeSessionDate(session.startedAt)}
        </p>
      </div>

      <SessionStatusBadge completed={session.completed} />
    </li>
  );
}

export function PomodoroHistoryPanel({
  sessions,
  className = '',
}: {
  sessions: PomodoroHistorySession[];
  className?: string;
}) {
  const groups = groupSessionsByDay(sessions);
  const completedWork = sessions.filter((s) => s.completed && !s.isBreak).length;

  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-lg dark:border-stone-800 dark:bg-stone-900/90 ${className}`}
    >
      <div className="shrink-0 border-b border-stone-100 px-4 py-3 dark:border-stone-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Son oturumlar</h2>
          </div>
          {sessions.length > 0 && (
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              {sessions.length}
            </span>
          )}
        </div>
        <p className="mt-1 text-[11px] leading-snug text-stone-500 dark:text-stone-400">
          {completedWork > 0
            ? `İstatistiklere ${completedWork} tamamlanan çalışma yansır.`
            : 'Çalışma ve mola oturumları birlikte listelenir.'}
        </p>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {sessions.length === 0 ? (
          <div className="flex h-full min-h-[8rem] flex-col items-center justify-center px-2 py-6 text-center">
            <Timer className="mb-2 h-7 w-7 text-stone-300 dark:text-stone-600" aria-hidden />
            <p className="text-xs font-medium text-stone-600 dark:text-stone-400">Henüz oturum yok</p>
          </div>
        ) : (
          <div className="space-y-3 pb-1">
            {groups.map((group) => (
              <section key={group.label}>
                <h3 className="sticky top-0 z-[1] mb-1.5 bg-white/95 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-500 backdrop-blur-sm dark:bg-stone-900/95 dark:text-stone-400">
                  {group.label}
                </h3>
                <ul className="space-y-1.5">
                  {group.sessions.map((session) => (
                    <SessionRow key={session.id} session={session} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
