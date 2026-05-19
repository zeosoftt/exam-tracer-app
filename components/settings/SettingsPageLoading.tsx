import { Loader2 } from 'lucide-react';

export function SettingsPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-950">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
    </div>
  );
}
