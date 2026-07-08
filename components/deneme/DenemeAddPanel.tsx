'use client';

import { FlashMessage } from '@/components/ui';
import { DenemeAddButtonTrigger } from '@/components/deneme/DenemeAddButtonTrigger';
import {
  InstitutionImportAlerts,
  InstitutionImportFetchButton,
  InstitutionImportPreview,
  InstitutionImportUrlField,
  useInstitutionImport,
} from '@/components/deneme/PegemImportPanel';
import type { DenemeAttemptListItem } from '@/lib/client-api/denemeClient';
import type { ExamOption } from '@/components/deneme/hooks/denemeFormTypes';

type DenemeAddPanelProps = {
  exams: ExamOption[];
  activeExamId: string | null;
  formMessage: { type: 'success' | 'error'; text: string } | null;
  onImportSaved: (attempt: DenemeAttemptListItem) => void;
};

function OrDivider({ vertical = false }: { vertical?: boolean }) {
  return (
    <div
      className={
        vertical
          ? 'flex shrink-0 items-center justify-center self-stretch px-1 md:px-2'
          : 'flex items-center justify-center py-1 md:hidden'
      }
      role="separator"
      aria-label="veya"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">veya</span>
    </div>
  );
}

export function DenemeAddPanel({ exams, activeExamId, formMessage, onImportSaved }: DenemeAddPanelProps) {
  const importVm = useInstitutionImport({ exams, activeExamId, onSaved: onImportSaved });

  return (
    <section
      className="mb-6 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/80"
      aria-labelledby="deneme-add-heading"
    >
    

      <div className="px-5 py-5 sm:px-6">
        {formMessage ? (
          <div className="mb-4">
            <FlashMessage type={formMessage.type} variant="bordered">
              {formMessage.text}
            </FlashMessage>
          </div>
        ) : null}

        <form onSubmit={(e) => void importVm.handleFetch(e)}>
          <div className="flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,3fr)_auto_minmax(0,1fr)] md:items-center md:gap-0">
            <div className="min-w-0 md:pr-4">
              <h3 id="institution-import-heading" className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Kurum sonuç linki
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                Pegem, Benim Hocam vb. sonuç sayfası linki — netler ve konu dağılımı otomatik okunur.
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <InstitutionImportUrlField vm={importVm} />
                <InstitutionImportFetchButton vm={importVm} className="w-full shrink-0 sm:w-auto" />
              </div>
            </div>

            <OrDivider vertical />

            <div className="flex min-w-0 flex-col gap-3 md:pl-4">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">Manuel kayıt</h3>
              <DenemeAddButtonTrigger className="w-full" />
            </div>
          </div>
        </form>

        <InstitutionImportAlerts vm={importVm} />
        <InstitutionImportPreview vm={importVm} />
      </div>
    </section>
  );
}
