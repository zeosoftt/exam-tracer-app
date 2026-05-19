export interface PomodoroSession {
  id: string;
  duration: number;
  isBreak: boolean;
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
}

export type PomodoroTimerTab = 'pomodoro' | 'deneme';
