'use client';

import { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
import type { DetailData } from '../detail/dashboardDetailTypes';
import { fetchDashboardDetailData } from '@/lib/client-api/dashboardClient';
import { selectSection, selectSubject } from '../domain/detailSelectors';

export function useDashboardDetailData() {
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastDetailFetchAtRef = useRef(0);
  const detailFetchInFlightRef = useRef(false);
  const initialSelectionAppliedRef = useRef(false);

  const fetchDetailData = useCallback(async (options?: { force?: boolean }) => {
    const now = Date.now();
    if (!options?.force && now - lastDetailFetchAtRef.current < 10000) return;
    if (detailFetchInFlightRef.current) return;

    detailFetchInFlightRef.current = true;
    try {
      const data = await fetchDashboardDetailData(options);
      if (data) {
        startTransition(() => {
          setDetailData(data);
        });
        lastDetailFetchAtRef.current = Date.now();

        if (data.sections?.length > 0 && !initialSelectionAppliedRef.current) {
          initialSelectionAppliedRef.current = true;
          const firstSection = data.sections[0];
          setSelectedSectionId(firstSection.id);
          if (firstSection.subjects?.length > 0) {
            setSelectedSubjectId(firstSection.subjects[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      detailFetchInFlightRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDetailData();
  }, [fetchDetailData]);

  const selectedSection = useMemo(
    () => selectSection(detailData, selectedSectionId),
    [detailData, selectedSectionId],
  );
  const selectedSubject = useMemo(
    () => selectSubject(selectedSection, selectedSubjectId),
    [selectedSection, selectedSubjectId],
  );

  useEffect(() => {
    if (selectedSection && selectedSection.subjects.length > 0) {
      const currentSubject = selectedSection.subjects.find((s) => s.id === selectedSubjectId);
      if (!currentSubject) {
        setSelectedSubjectId(selectedSection.subjects[0].id);
      }
    }
  }, [selectedSectionId, selectedSection, selectedSubjectId]);

  return {
    detailData,
    isLoading,
    fetchDetailData,
    selectedSectionId,
    setSelectedSectionId,
    selectedSubjectId,
    setSelectedSubjectId,
    selectedSection,
    selectedSubject,
  };
}
