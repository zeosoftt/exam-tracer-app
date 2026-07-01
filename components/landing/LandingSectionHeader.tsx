type LandingSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
  className?: string;
};

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
}: LandingSectionHeaderProps) {
  const alignClass = align === 'center' ? 'mx-auto w-full text-center' : 'text-left';

  return (
    <header className={`mb-8 max-w-2xl px-1 sm:mb-12 ${alignClass} ${className}`}>
      {eyebrow ? (
        <p className="landing-section-eyebrow mb-3 text-xs font-bold tracking-[0.14em] text-primary-700 dark:text-primary-300">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base text-stone-600 dark:text-stone-300 sm:text-lg">{description}</p>
      ) : null}
    </header>
  );
}
