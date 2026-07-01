import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type PublicBackLinkProps = {
  href: string;
  label: string;
};

export function PublicBackLink({ href, label }: PublicBackLinkProps) {
  return (
    <Link
      href={href}
      className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-stone-200/80 bg-white/60 px-3 py-1.5 text-sm font-medium text-stone-600 backdrop-blur-sm transition-colors hover:border-primary-200 hover:text-primary-800 dark:border-stone-700/80 dark:bg-stone-900/60 dark:text-stone-400 dark:hover:border-primary-800 dark:hover:text-primary-200 sm:mb-8"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
