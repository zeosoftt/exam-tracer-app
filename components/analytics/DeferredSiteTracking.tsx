'use client';

import { useEffect, useState } from 'react';
import type { PublicTrackingConfig } from '@/lib/siteSettings';
import { SiteTrackingScripts } from '@/components/analytics/SiteTracking';

type DeferredSiteTrackingProps = {
  tracking: PublicTrackingConfig;
};

/**
 * GTM / GA / AdSense — ilk etkileşim veya idle sonrası yüklenir (TBT azaltma).
 */
export function DeferredSiteTracking({ tracking }: DeferredSiteTrackingProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;

    let done = false;
    const activate = () => {
      if (done) return;
      done = true;
      setReady(true);
    };

    const onInteract = () => activate();

    window.addEventListener('scroll', onInteract, { once: true, passive: true });
    window.addEventListener('pointerdown', onInteract, { once: true, passive: true });
    window.addEventListener('keydown', onInteract, { once: true });

    const idleId =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback(activate, { timeout: 4500 })
        : window.setTimeout(activate, 4500);

    return () => {
      window.removeEventListener('scroll', onInteract);
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
      if (typeof cancelIdleCallback === 'function' && typeof idleId === 'number') {
        cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, [ready]);

  if (!ready) return null;

  return <SiteTrackingScripts tracking={tracking} />;
}
