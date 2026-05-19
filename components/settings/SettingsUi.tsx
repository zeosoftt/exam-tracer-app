'use client';

import { cn } from '@/lib/utils/cn';

type ToggleSwitchProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  'aria-label': string;
  className?: string;
};

/** Ayarlar sayfası toggle stili — tekrarlayan markup tek yerde (DRY). */
export function ToggleSwitch({
  checked,
  defaultChecked,
  onChange,
  'aria-label': ariaLabel,
  className,
}: ToggleSwitchProps) {
  return (
    <label className={cn('relative inline-flex cursor-pointer items-center', className)}>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        defaultChecked={defaultChecked}
        aria-label={ariaLabel}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <div className="h-6 w-11 rounded-full bg-stone-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-stone-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300/40 dark:bg-stone-700 dark:after:border-stone-600 dark:after:bg-stone-200 dark:peer-focus:ring-primary-800/40" />
    </label>
  );
}
