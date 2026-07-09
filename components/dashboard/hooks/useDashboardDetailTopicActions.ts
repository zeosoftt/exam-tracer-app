'use client';

import { useState, useCallback } from 'react';
import type { Topic } from '../detail/dashboardDetailTypes';
import { patchTopicProgress } from '@/lib/client-api/progressClient';

type RefetchDetail = (options?: { force?: boolean }) => Promise<void>;

export function useDashboardDetailTopicActions(fetchDetailData: RefetchDetail) {
  const [updatingTopicId, setUpdatingTopicId] = useState<string | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
  } | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'error'; text: string } | null>(null);

  const updateTopicStatus = useCallback(
    async (topicId: string, newStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => {
      setUpdatingTopicId(topicId);
      setActionMessage(null);
      try {
        const { ok, error } = await patchTopicProgress(topicId, { status: newStatus });
        if (ok) {
          await fetchDetailData({ force: true });
        } else {
          console.error('Failed to update topic status:', error);
          setActionMessage({ type: 'error', text: 'Durum güncellenirken bir hata oluştu' });
        }
      } catch (error) {
        console.error('Error updating topic status:', error);
        setActionMessage({ type: 'error', text: 'Durum güncellenirken bir hata oluştu' });
      } finally {
        setUpdatingTopicId(null);
      }
    },
    [fetchDetailData],
  );

  const updateQuestionStats = useCallback(
    async (topicId: string) => {
      if (!editValues) return;
      setUpdatingTopicId(topicId);
      setActionMessage(null);
      try {
        if (editValues.correctAnswers + editValues.wrongAnswers > editValues.totalQuestions) {
          setActionMessage({
            type: 'error',
            text: 'Doğru + Yanlış sayısı toplam soru sayısını geçemez!',
          });
          setUpdatingTopicId(null);
          return;
        }
        const { ok, error } = await patchTopicProgress(topicId, {
          totalQuestions: editValues.totalQuestions,
          correctAnswers: editValues.correctAnswers,
          wrongAnswers: editValues.wrongAnswers,
        });
        if (ok) {
          await fetchDetailData({ force: true });
          setEditingTopicId(null);
          setEditValues(null);
        } else {
          console.error('Failed to update question stats:', error);
          setActionMessage({ type: 'error', text: 'Soru sayıları güncellenirken bir hata oluştu' });
        }
      } catch (error) {
        console.error('Error updating question stats:', error);
        setActionMessage({ type: 'error', text: 'Soru sayıları güncellenirken bir hata oluştu' });
      } finally {
        setUpdatingTopicId(null);
      }
    },
    [editValues, fetchDetailData],
  );

  const startEdit = useCallback((topic: Topic) => {
    setEditingTopicId(topic.id);
    setEditValues({
      totalQuestions: topic.totalQuestions || 0,
      correctAnswers: topic.correctAnswers || 0,
      wrongAnswers: topic.wrongAnswers || 0,
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingTopicId(null);
    setEditValues(null);
  }, []);

  return {
    updatingTopicId,
    editingTopicId,
    editValues,
    setEditValues,
    updateTopicStatus,
    updateQuestionStats,
    startEdit,
    cancelEdit,
    actionMessage,
    clearActionMessage: () => setActionMessage(null),
  };
}
