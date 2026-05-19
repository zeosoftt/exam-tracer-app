/** Ayarlar formu — tutarlı alan stilleri (DRY). */

export const settingsLabelClass =
  'mb-1.5 block text-sm font-semibold text-stone-700 dark:text-stone-300';

export const settingsFieldClass =
  'w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-primary-500';

export const settingsSelectClass = `${settingsFieldClass} cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-10 [background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2378716c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] dark:[background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a8a29e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")]`;

export const settingsFieldDisabledClass =
  'w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-2.5 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-400';

export const settingsHelperClass = 'mt-1.5 text-xs leading-relaxed text-stone-500 dark:text-stone-400';

/** Sınav adında kod zaten geçiyorsa tekrar ekleme */
export function formatExamOptionLabel(name: string, code: string): string {
  const trimmedName = name.trim();
  const trimmedCode = code.trim();
  if (!trimmedCode) return trimmedName;
  if (new RegExp(`\\(${trimmedCode}\\)`, 'i').test(trimmedName)) return trimmedName;
  if (trimmedName.toLowerCase().includes(trimmedCode.toLowerCase())) return trimmedName;
  return `${trimmedName} (${trimmedCode})`;
}
