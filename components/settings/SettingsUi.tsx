import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { settingsCardClass } from '@/lib/settings/settingsFormStyles';

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

type SettingsSectionCardProps = {
  title: string;
  icon: ReactNode;
  iconClassName?: string;
  children: ReactNode;
  description?: string;
};

export function SettingsSectionCard({
  title,
  icon,
  iconClassName = 'bg-primary-100 dark:bg-primary-950/60',
  children,
  description,
}: SettingsSectionCardProps) {
  return (
    <div className={settingsCardClass}>
      <div className="mb-6 flex items-start gap-3">
        <div className={cn('rounded-full p-3', iconClassName)}>{icon}</div>
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 sm:text-2xl">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}
