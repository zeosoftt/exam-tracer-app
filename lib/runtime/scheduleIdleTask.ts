/**
 * İlk boyama / hidrasyon sonrası düşük öncelikli işleri planlar (TBT / ana iş parçacığı).
 * requestIdleCallback yoksa kısa setTimeout ile yaklaşım.
 */

export type ScheduleIdleOptions = {
  /** Tarayıcı boşta kalamazsa en geç bu sürede çalıştır (ms). */
  timeout?: number;
};

export function scheduleIdleTask(
  task: () => void,
  options?: ScheduleIdleOptions,
): void {
  const timeout = options?.timeout ?? 2000;

  if (typeof window === 'undefined') {
    queueMicrotask(task);
    return;
  }

  const ric = (
    window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    }
  ).requestIdleCallback;

  if (typeof ric === 'function') {
    ric(() => task(), { timeout });
    return;
  }

  window.setTimeout(task, 48);
}
