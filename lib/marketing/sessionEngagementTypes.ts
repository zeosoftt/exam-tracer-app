export type SessionEngagementStats = {
  sessionsLast7Days: number;
  sessionsLast30Days: number;
  avgDurationSeconds7d: number;
  avgDurationSeconds30d: number;
  medianDurationSeconds7d: number;
  totalDurationMinutes7d: number;
  uniqueUsersLast7Days: number;
};

/** "12 dk" veya "1 sa 05 dk" */
export function formatDurationSeconds(seconds: number): string {
  if (seconds <= 0) return '0 dk';
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) return `${totalMinutes} dk`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} sa ${minutes} dk` : `${hours} sa`;
}
