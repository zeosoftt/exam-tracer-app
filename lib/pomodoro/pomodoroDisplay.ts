/** Pomodoro istatistik ve oturum listesi — görüntüleme yardımcıları */

export function formatStudyDuration(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (minutes === 0) return '0 dk';
  if (minutes < 60) return `${minutes} dk`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) return `${hours} saat`;
  return `${hours} sa ${rest} dk`;
}

export function formatSessionDuration(minutes: number): string {
  return `${minutes} dk`;
}

export function formatRelativeSessionDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000);

  const time = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0) return `Bugün, ${time}`;
  if (diffDays === 1) return `Dün, ${time}`;
  if (diffDays < 7) {
    const weekday = date.toLocaleDateString('tr-TR', { weekday: 'long' });
    return `${weekday}, ${time}`;
  }

  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDayGroupLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000);

  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Dün';
  return date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function groupSessionsByDay<T extends { startedAt: string }>(
  sessions: T[],
): Array<{ label: string; sessions: T[] }> {
  const map = new Map<string, T[]>();

  for (const session of sessions) {
    const key = new Date(session.startedAt).toDateString();
    const group = map.get(key);
    if (group) group.push(session);
    else map.set(key, [session]);
  }

  return Array.from(map.entries()).map(([, items]) => ({
    label: formatDayGroupLabel(items[0].startedAt),
    sessions: items,
  }));
}

export interface PomodoroStatPeriod {
  sessions: number;
  studyMinutes: number;
}

export function describeStatPeriod(
  period: 'today' | 'week' | 'total',
  data: PomodoroStatPeriod,
): { title: string; subtitle: string; detail: string } {
  const duration = formatStudyDuration(data.studyMinutes);
  const sessionLabel = data.sessions === 1 ? '1 oturum' : `${data.sessions} oturum`;

  switch (period) {
    case 'today':
      return {
        title: 'Bugün',
        subtitle: sessionLabel,
        detail:
          data.studyMinutes > 0
            ? `${duration} odak süresi`
            : 'Henüz tamamlanan çalışma yok',
      };
    case 'week':
      return {
        title: 'Bu hafta',
        subtitle: sessionLabel,
        detail:
          data.studyMinutes > 0
            ? `${duration} odak süresi (Pazar gününden itibaren)`
            : 'Bu hafta tamamlanan çalışma yok',
      };
    case 'total':
      return {
        title: 'Tüm zamanlar',
        subtitle: sessionLabel,
        detail:
          data.studyMinutes > 0
            ? `${duration} toplam odak süresi`
            : 'Henüz kayıtlı çalışma yok',
      };
  }
}
