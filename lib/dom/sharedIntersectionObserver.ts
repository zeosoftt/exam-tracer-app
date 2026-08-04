/**
 * Tek IntersectionObserver — çok sayıda LandingReveal instance'ında TBT azaltır.
 */

const REVEAL_OPTIONS: IntersectionObserverInit = {
  rootMargin: '0px 0px -6% 0px',
  threshold: 0.08,
};

let observer: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

function getObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined') return null;
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const cb = callbacks.get(entry.target);
        if (cb) {
          cb();
          callbacks.delete(entry.target);
          observer?.unobserve(entry.target);
        }
      }
    }, REVEAL_OPTIONS);
  }
  return observer;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function observeReveal(el: Element, onVisible: () => void): () => void {
  if (prefersReducedMotion()) {
    onVisible();
    return () => {};
  }

  callbacks.set(el, onVisible);
  getObserver()?.observe(el);

  return () => {
    callbacks.delete(el);
    observer?.unobserve(el);
  };
}
