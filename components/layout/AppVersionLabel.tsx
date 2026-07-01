import { getAppVersionLabel } from '@/lib/site/appVersion';

type AppVersionLabelProps = {
  className?: string;
};

/** Site genelinde gösterilen uygulama sürüm etiketi */
export function AppVersionLabel({ className = '' }: AppVersionLabelProps) {
  return (
    <span
      className={`font-mono text-xs tabular-nums text-stone-400 dark:text-stone-500 ${className}`.trim()}
      title="Uygulama sürümü"
    >
      {getAppVersionLabel()}
    </span>
  );
}
