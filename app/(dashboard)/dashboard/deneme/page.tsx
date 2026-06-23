/**
 * Deneme takibi — Suspense ile erken iskelet, ardından sunucu listesi (Speed Index).
 */

import { Suspense } from 'react';
import { requirePageSession } from '@/lib/auth/pageSession';
import { loadDenemePageData } from '@/lib/deneme/loadDenemePageData';
import { DenemePageStaticContent } from '@/components/deneme/DenemePageStaticContent';
import { DenemePageOverlays } from '@/components/deneme/DenemePageOverlays';
import { DenemeRouteSkeleton } from '@/components/ui/DenemeRouteSkeleton';

async function DenemePageContent() {
  const session = await requirePageSession();
  const initialData = await loadDenemePageData(session.user.id);

  return (
    <>
      <DenemePageStaticContent data={initialData} />
      <DenemePageOverlays initialData={initialData} />
    </>
  );
}

export default function DenemePage() {
  return (
    <Suspense fallback={<DenemeRouteSkeleton />}>
      <DenemePageContent />
    </Suspense>
  );
}
