import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type Crumb = { name: string; path: string };

type SeoBreadcrumbsProps = {
  crumbs: Crumb[];
};

/** Görünür breadcrumb — JSON-LD BreadcrumbList ile aynı hiyerarşi. */
export function SeoBreadcrumbs({ crumbs }: SeoBreadcrumbsProps) {
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Konum" className="mb-4 text-sm text-stone-500 dark:text-stone-400">
      <ol className="flex flex-wrap items-center gap-1">
        {crumbs.map(({ name, path }, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={path} className="inline-flex items-center gap-1">
              {index > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
              ) : null}
              {isLast ? (
                <span className="font-medium text-stone-700 dark:text-stone-200" aria-current="page">
                  {name}
                </span>
              ) : (
                <Link
                  href={path}
                  className="transition-colors hover:text-primary-700 dark:hover:text-primary-300"
                >
                  {name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
