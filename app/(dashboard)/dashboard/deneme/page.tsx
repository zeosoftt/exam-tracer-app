/**
 * Deneme takibi — Suspense ile erken iskelet, ardından sunucu listesi (Speed Index).
 */

import { Suspense } from 'react';
import { requirePageSession } from '@/lib/auth/pageSession';
import { loadDenemePageData } from '@/lib/deneme/loadDenemePageData';
import { DenemePageProvider } from '@/components/deneme/DenemePageContext';
import { DenemePageSummary, DenemePageAdd, DenemePageModal } from '@/components/deneme/DenemePageClient';
import { DenemePageStaticContent } from '@/components/deneme/DenemePageStaticContent';
import { DenemeRouteSkeleton } from '@/components/ui/DenemeRouteSkeleton';

async function DenemePageContent() {
  const session = await requirePageSession();
  const initialData = await loadDenemePageData(session.user.id);

  return (
    <DenemePageProvider initialData={initialData}>
      <DenemePageStaticContent
        data={initialData}
        topContent={
          <>
            <DenemePageSummary />
            <DenemePageAdd />
          </>
        }
      />
      <DenemePageModal />
    </DenemePageProvider>
  );
}

export default function DenemePage() {
  return (
    <Suspense fallback={<DenemeRouteSkeleton />}>
      <DenemePageContent />
    </Suspense>
  );
}
