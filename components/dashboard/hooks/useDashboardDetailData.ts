'use client';

import { useState, useEffect, useRef, useCallback, useMemo, startTransition } from 'react';
import type { DetailData, Topic } from '../detail/dashboardDetailTypes';
import { fetchDashboardDetailData } from '@/lib/client-api/dashboardClient';
import { selectSection, selectSubject } from '../domain/detailSelectors';

export function useDashboardDetailData() {
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastDetailFetchAtRef = useRef(0);
  const detailFetchInFlightRef = useRef(false);
  const initialSelectionAppliedRef = useRef(false);

  /**
   * Detay verisini yükler. Başarıda true döner; istek başarısız olursa false.
   * Zorlanmamış (throttle'a takılan) çağrılar başarısızlık sayılmaz.
   */
  const fetchDetailData = useCallback(async (options?: { force?: boolean }): Promise<boolean> => {
    const now = Date.now();
    if (!options?.force && now - lastDetailFetchAtRef.current < 10000) return true;
    if (detailFetchInFlightRef.current) return false;

    detailFetchInFlightRef.current = true;
    try {
      const result = await fetchDashboardDetailData(options);
      if (result.ok) {
        const data = result.data;
        setFetchError(null);
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
        return true;
      }
      // Yenileme başarısız: eldeki veri korunur, hata yalnızca ilk yüklemede tam ekran gösterilir.
      console.error('Failed to fetch dashboard detail:', result.status, result.message);
      setFetchError((prev) => (detailData ? prev : (result.message ?? 'Veriler yüklenemedi.')));
      return false;
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setFetchError((prev) => (detailData ? prev : 'Veriler yüklenemedi.'));
      return false;
    } finally {
      detailFetchInFlightRef.current = false;
      setIsLoading(false);
    }
    // detailData yalnızca "ilk yükleme mi" kararı için okunur; bağımlılığa eklemek
    // her veri değişiminde callback'i yeniler ve effect'i tekrar tetiklerdi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Sunucuda başarıyla kaydedilen bir konu değişikliğini yerel veriye iyimser olarak uygular.
   * Ardından gelen yenileme başarısız olsa bile tablo doğru durumu gösterir.
   */
  const applyTopicPatch = useCallback((topicId: string, patch: Partial<Topic>) => {
    setDetailData((prev) => {
      if (!prev) return prev;
      let changed = false;
      const sections = prev.sections.map((section) => {
        const subjects = section.subjects.map((subject) => {
          const idx = subject.topics.findIndex((t) => t.id === topicId);
          if (idx === -1) return subject;
          changed = true;
          const topics = subject.topics.slice();
          topics[idx] = { ...topics[idx], ...patch };
          return { ...subject, topics };
        });
        return subjects === section.subjects ? section : { ...section, subjects };
      });
      return changed ? { ...prev, sections } : prev;
    });
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
    fetchError,
    isLoading,
    fetchDetailData,
    applyTopicPatch,
    selectedSectionId,
    setSelectedSectionId,
    selectedSubjectId,
    setSelectedSubjectId,
    selectedSection,
    selectedSubject,
  };
}
