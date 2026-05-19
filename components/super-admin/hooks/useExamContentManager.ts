'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import type { EntityType, ExamContentModal, ExamNode, SectionNode, SubjectNode, TopicNode } from '../domain/examContentTypes';
import { reorderArray } from '../domain/examContentReorder';
import {
  deleteExamContentEntity,
  fetchExamContentTree,
  patchTopicOrder,
  persistExamContentModal,
} from '@/lib/client-api/examContentClient';

export function useExamContentManager() {
  const [exams, setExams] = useState<ExamNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedExam, setExpandedExam] = useState<Set<string>>(new Set());
  const [expandedSection, setExpandedSection] = useState<Set<string>>(new Set());
  const [expandedSubject, setExpandedSubject] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ExamContentModal>(null);
  const [form, setForm] = useState<Record<string, string | number | null>>({});
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draggedTopicId, setDraggedTopicId] = useState<string | null>(null);
  const [reorderingSubjectId, setReorderingSubjectId] = useState<string | null>(null);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchExamContentTree();
      startTransition(() => setExams(list));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'İçerik ağacı yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTree();
  }, [fetchTree]);

  const toggleExam = useCallback((id: string) => {
    setExpandedExam((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSection = useCallback((id: string) => {
    setExpandedSection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSubject = useCallback((id: string) => {
    setExpandedSubject((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const openAdd = useCallback((type: EntityType, parentId?: string, parentExamId?: string, parentSectionId?: string) => {
    setModal({ type, parentId, parentExamId, parentSectionId });
    setForm(type === 'exam' ? { name: '', code: '', description: '', status: 'ACTIVE', startDate: '' } : { name: '', code: '', description: '', order: 0 });
    if (type === 'topic') setForm((f) => ({ ...f, examQuestionCount: '' }));
    setActionError(null);
  }, []);

  const openEdit = useCallback((type: EntityType, entity: ExamNode | SectionNode | SubjectNode | TopicNode, parentId?: string) => {
    setModal({ type, parentId, edit: entity });
    const e = entity as unknown as Record<string, unknown>;
    const startDateVal =
      e.startDate != null
        ? typeof e.startDate === 'string'
          ? e.startDate.slice(0, 10)
          : new Date(e.startDate as Date).toISOString().slice(0, 10)
        : '';
    setForm({
      name: String(e.name ?? ''),
      code: String(e.code ?? ''),
      description: e.description != null ? String(e.description) : '',
      order: typeof e.order === 'number' ? e.order : 0,
      status: type === 'exam' ? String(e.status ?? '') : '',
      startDate: type === 'exam' ? startDateVal : '',
      examQuestionCount: type === 'topic' ? (typeof e.examQuestionCount === 'number' ? e.examQuestionCount : '') : '',
    });
    setActionError(null);
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setForm({});
    setActionError(null);
  }, []);

  const save = useCallback(async () => {
    if (!modal) return;
    setSaving(true);
    setActionError(null);
    try {
      await persistExamContentModal(modal, form);
      closeModal();
      await fetchTree();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'İşlem başarısız.');
    } finally {
      setSaving(false);
    }
  }, [modal, form, closeModal, fetchTree]);

  const remove = useCallback(
    async (type: EntityType, id: string) => {
      if (!confirm('Silmek istediğinize emin misiniz? Alt öğeler de etkilenebilir.')) return;
      setDeletingId(id);
      setActionError(null);
      try {
        await deleteExamContentEntity(type, id);
        await fetchTree();
      } catch (e) {
        setActionError(e instanceof Error ? e.message : 'Silinemedi.');
      } finally {
        setDeletingId(null);
      }
    },
    [fetchTree],
  );

  const handleTopicDragStart = useCallback((e: React.DragEvent, topicId: string) => {
    setDraggedTopicId(topicId);
    e.dataTransfer.setData('text/plain', topicId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleTopicDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleTopicDrop = useCallback(
    async (e: React.DragEvent, subject: SubjectNode, dropTargetTopicId: string) => {
      e.preventDefault();
      setDraggedTopicId(null);
      const draggedId = e.dataTransfer.getData('text/plain');
      if (!draggedId || draggedId === dropTargetTopicId) return;
      const fromIndex = subject.topics.findIndex((t) => t.id === draggedId);
      const toIndex = subject.topics.findIndex((t) => t.id === dropTargetTopicId);
      if (fromIndex === -1 || toIndex === -1) return;
      const reordered = reorderArray(subject.topics, fromIndex, toIndex);
      setReorderingSubjectId(subject.id);
      setActionError(null);
      try {
        for (let i = 0; i < reordered.length; i++) {
          const topic = reordered[i] as TopicNode;
          if (topic.order === i) continue;
          await patchTopicOrder(topic.id, i);
        }
        await fetchTree();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Sıra güncellenemedi.');
      } finally {
        setReorderingSubjectId(null);
      }
    },
    [fetchTree],
  );

  const handleTopicDragEnd = useCallback(() => {
    setDraggedTopicId(null);
  }, []);

  return {
    exams,
    loading,
    error,
    expandedExam,
    expandedSection,
    expandedSubject,
    modal,
    form,
    setForm,
    saving,
    actionError,
    setActionError,
    deletingId,
    draggedTopicId,
    reorderingSubjectId,
    fetchTree,
    toggleExam,
    toggleSection,
    toggleSubject,
    openAdd,
    openEdit,
    closeModal,
    save,
    remove,
    handleTopicDragStart,
    handleTopicDragOver,
    handleTopicDrop,
    handleTopicDragEnd,
  };
}
