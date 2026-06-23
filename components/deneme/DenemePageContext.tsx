'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useDenemePage } from '@/components/deneme/hooks/useDenemePage';
import type { DenemePageInitialData } from '@/lib/deneme/loadDenemePageData';

type DenemePageContextValue = ReturnType<typeof useDenemePage>;

const DenemePageContext = createContext<DenemePageContextValue | null>(null);

export function DenemePageProvider({
  initialData,
  children,
}: {
  initialData: DenemePageInitialData;
  children: ReactNode;
}) {
  const value = useDenemePage(initialData);
  return <DenemePageContext.Provider value={value}>{children}</DenemePageContext.Provider>;
}

export function useDenemePageContext() {
  const ctx = useContext(DenemePageContext);
  if (!ctx) {
    throw new Error('useDenemePageContext must be used within DenemePageProvider');
  }
  return ctx;
}
