import Link from 'next/link';
import { AppVersionLabel } from '@/components/layout/AppVersionLabel';

/** Giriş, kayıt, onboarding gibi sayfalarda alt footer */
export function AuthPageFooter() {
  return (
    <footer className="border-t border-stone-200/80 bg-white/80 px-4 py-5 text-center backdrop-blur-sm dark:border-stone-800/80 dark:bg-stone-950/80">
      <p className="text-xs text-stone-500 dark:text-stone-400 sm:text-sm">
        © {new Date().getFullYear()} The Goal Lab
        <span className="mx-1.5 text-stone-300 dark:text-stone-600" aria-hidden>
          ·
        </span>
        <AppVersionLabel className="inline" />
      </p>
      <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
        <Link href="/" className="transition-colors hover:text-primary-700 dark:hover:text-primary-300">
          Ana sayfa
        </Link>
        <span className="mx-2 text-stone-300 dark:text-stone-600" aria-hidden>
          ·
        </span>
        <Link href="/destek" className="transition-colors hover:text-primary-700 dark:hover:text-primary-300">
          Destek
        </Link>
      </p>
    </footer>
  );
}
