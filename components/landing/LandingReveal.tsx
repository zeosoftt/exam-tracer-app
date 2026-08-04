'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';
import { observeReveal, prefersReducedMotion } from '@/lib/dom/sharedIntersectionObserver';
import { cn } from '@/lib/utils/cn';

type LandingRevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms */
  delay?: number;
  as?: ElementType;
};

export function LandingReveal({
  children,
  className,
  delay = 0,
  as: Component = 'div',
}: LandingRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    return observeReveal(el, () => setVisible(true));
  }, []);

  const style = {
    '--landing-reveal-delay': `${delay}ms`,
  } as CSSProperties;

  return (
    <Component
      ref={ref}
      className={cn('landing-reveal', visible && 'is-visible', className)}
      style={style}
    >
      {children}
    </Component>
  );
}
