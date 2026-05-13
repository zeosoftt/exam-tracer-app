'use client';

import { useState, useCallback } from 'react';
import type { DashboardEvaluationTopic, TopicEditValues, EvaluationFilter } from '../domain/dashboardTypes';
import type { FetchStatsOptions } from '../api/fetchDashboardData';
import { patchTopicProgress } from '@/lib/client-api/progressClient';

type RefetchStats = (options?: FetchStatsOptions) => Promise<void>;

export function useEvaluationTopicEditor(fetchStats: RefetchStats) {
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<TopicEditValues | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [evaluationFilter, setEvaluationFilter] = useState<EvaluationFilter>(null);
  const [reviewAckTopicId, setReviewAckTopicId] = useState<string | null>(null);

  const updateQuestionStats = useCallback(
    async (topicId: string) => {
      if (!editValues) return;
      try {
        if (editValues.correctAnswers + editValues.wrongAnswers > editValues.totalQuestions) {
          alert('Doğru + Yanlış sayısı toplam soru sayısını geçemez!');
          return;
        }
        const { ok, error } = await patchTopicProgress(topicId, {
          totalQuestions: editValues.totalQuestions,
          correctAnswers: editValues.correctAnswers,
          wrongAnswers: editValues.wrongAnswers,
        });
        if (ok) {
          await fetchStats({ force: true, lite: false });
          setEditingTopicId(null);
          setEditValues(null);
        } else {
          console.error('Failed to update question stats:', error);
          alert('Soru sayıları güncellenirken bir hata oluştu');
        }
      } catch (error) {
        console.error('Error updating question stats:', error);
        alert('Soru sayıları güncellenirken bir hata oluştu');
      }
    },
    [editValues, fetchStats],
  );

  const startEdit = useCallback((topic: DashboardEvaluationTopic) => {
    setEditingTopicId(topic.topicId);
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

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const acknowledgeTopicReview = useCallback(
    async (topicId: string) => {
      setReviewAckTopicId(topicId);
      try {
        const { ok } = await patchTopicProgress(topicId, { reviewCompleted: true });
        if (ok) await fetchStats({ force: true, lite: false });
      } finally {
        setReviewAckTopicId(null);
      }
    },
    [fetchStats],
  );

  return {
    editingTopicId,
    editValues,
    setEditValues,
    expandedSections,
    evaluationFilter,
    setEvaluationFilter,
    reviewAckTopicId,
    updateQuestionStats,
    startEdit,
    cancelEdit,
    toggleSection,
    acknowledgeTopicReview,
  };
}
