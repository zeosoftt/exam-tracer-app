'use client';

import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Layers,
  FileText,
  FolderOpen,
  Loader2,
  GripVertical,
} from 'lucide-react';
import { useExamContentManager } from '@/components/super-admin/hooks/useExamContentManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function ExamContentManager() {
  const {
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
  } = useExamContentManager();

  const modalTitle = modal
    ? modal.edit
      ? modal.type === 'exam'
        ? 'Sınav düzenle'
        : modal.type === 'section'
          ? 'Bölüm düzenle'
          : modal.type === 'subject'
            ? 'Ders düzenle'
            : 'Konu düzenle'
      : modal.type === 'exam'
        ? 'Yeni sınav'
        : modal.type === 'section'
          ? 'Yeni bölüm'
          : modal.type === 'subject'
            ? 'Yeni ders'
            : 'Yeni konu'
    : '';

  return (
    <div className="space-y-6">
      {actionError && !modal ? (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between gap-2">
            <span>{actionError}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => setActionError(null)}>
              Kapat
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Sınav → Bölüm → Ders → Konu ağacını buradan yönetin.
        </p>
        <Button type="button" onClick={() => openAdd('exam')}>
          <Plus className="h-4 w-4" />
          Yeni sınav
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Henüz sınav yok. &quot;Yeni sınav&quot; ile ekleyin.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-1 p-0">
            {exams.map((exam) => (
              <div key={exam.id} className="border-b last:border-b-0">
                <div className="flex items-center gap-2 bg-muted/40 px-4 py-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => toggleExam(exam.id)}
                  >
                    {expandedExam.has(exam.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{exam.name}</span>
                  <span className="text-xs text-muted-foreground">({exam.code})</span>
                  {exam.startDate ? (
                    <span className="text-xs font-medium text-primary">
                      Sınav: {new Date(exam.startDate).toLocaleDateString('tr-TR')}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Tarih yok</span>
                  )}
                  <Badge variant={exam.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {exam.status}
                  </Badge>
                  <div className="ml-auto flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit('exam', exam)}
                      title="Düzenle"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => remove('exam', exam.id)}
                      disabled={deletingId === exam.id}
                      title="Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary"
                      onClick={() => openAdd('section', exam.id)}
                      title="Bölüm ekle"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {expandedExam.has(exam.id) ? (
                  <div className="space-y-2 px-4 py-2 pl-8">
                    {exam.sections.length === 0 ? (
                      <p className="py-2 text-xs text-muted-foreground">Bölüm yok. + ile ekleyin.</p>
                    ) : (
                      exam.sections.map((section) => (
                        <div key={section.id} className="rounded-lg border bg-card">
                          <div className="flex items-center gap-2 px-3 py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleSection(section.id)}
                            >
                              {expandedSection.has(section.id) ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Layers className="h-3.5 w-3.5 text-amber-600" />
                            <span className="text-sm font-medium">{section.name}</span>
                            <span className="text-xs text-muted-foreground">({section.code})</span>
                            <div className="ml-auto flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEdit('section', section)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => remove('section', section.id)}
                                disabled={deletingId === section.id}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-primary"
                                onClick={() => openAdd('subject', section.id)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          {expandedSection.has(section.id) ? (
                            <div className="space-y-1 px-2 pb-2 pl-6">
                              {section.subjects.length === 0 ? (
                                <p className="py-1 text-xs text-muted-foreground">
                                  Ders yok. + ile ekleyin.
                                </p>
                              ) : (
                                section.subjects.map((subject) => (
                                  <div key={subject.id} className="rounded-md border bg-muted/30">
                                    <div className="flex items-center gap-2 px-2 py-1.5">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => toggleSubject(subject.id)}
                                      >
                                        {expandedSubject.has(subject.id) ? (
                                          <ChevronDown className="h-3 w-3" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3" />
                                        )}
                                      </Button>
                                      <FileText className="h-3 w-3 text-emerald-600" />
                                      <span className="text-xs font-medium">{subject.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ({subject.code})
                                      </span>
                                      <div className="ml-auto flex items-center gap-0.5">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => openEdit('subject', subject)}
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-destructive"
                                          onClick={() => remove('subject', subject.id)}
                                          disabled={deletingId === subject.id}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-primary"
                                          onClick={() => openAdd('topic', subject.id)}
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    {expandedSubject.has(subject.id) ? (
                                      <div className="space-y-0.5 px-2 pb-1 pl-5">
                                        {subject.topics.length === 0 ? (
                                          <p className="py-1 text-xs text-muted-foreground">
                                            Konu yok. + ile ekleyin.
                                          </p>
                                        ) : (
                                          subject.topics.map((topic) => (
                                            <div
                                              key={topic.id}
                                              data-topic-id={topic.id}
                                              draggable
                                              onDragStart={(e) => handleTopicDragStart(e, topic.id)}
                                              onDragOver={handleTopicDragOver}
                                              onDrop={(e) => handleTopicDrop(e, subject, topic.id)}
                                              onDragEnd={handleTopicDragEnd}
                                              className={`flex cursor-grab items-center gap-2 rounded px-2 py-1 hover:bg-muted active:cursor-grabbing ${
                                                draggedTopicId === topic.id ? 'opacity-50' : ''
                                              } ${reorderingSubjectId === subject.id ? 'pointer-events-none' : ''}`}
                                            >
                                              <GripVertical
                                                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                                                aria-hidden
                                              />
                                              <FolderOpen className="h-3 w-3 shrink-0 text-muted-foreground" />
                                              <span className="text-xs">{topic.name}</span>
                                              <span className="text-xs text-muted-foreground">
                                                ({topic.code})
                                              </span>
                                              {topic.examQuestionCount != null ? (
                                                <span className="text-xs text-primary">
                                                  {topic.examQuestionCount} soru
                                                </span>
                                              ) : null}
                                              <div className="ml-auto flex items-center gap-0.5">
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6"
                                                  onClick={() => openEdit('topic', topic)}
                                                >
                                                  <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-6 w-6 text-destructive"
                                                  onClick={() => remove('topic', topic.id)}
                                                  disabled={deletingId === topic.id}
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    ) : null}
                                  </div>
                                ))
                              )}
                            </div>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={Boolean(modal)} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          {actionError ? (
            <p className="text-sm text-destructive">{actionError}</p>
          ) : null}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="exam-name">Ad</Label>
              <Input
                id="exam-name"
                type="text"
                value={String(form.name ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-code">Kod</Label>
              <Input
                id="exam-code"
                type="text"
                value={String(form.code ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder={modal?.type === 'exam' ? 'KPSS' : 'örn: MAT'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-desc">Açıklama (opsiyonel)</Label>
              <Input
                id="exam-desc"
                type="text"
                value={String(form.description ?? '')}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            {modal?.type === 'exam' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="exam-date">Sınav tarihi</Label>
                  <Input
                    id="exam-date"
                    type="date"
                    value={String(form.startDate ?? '')}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value || '' }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Dashboard hedef kartında &quot;Sınava X gün kaldı&quot; gösterilir.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exam-status">Durum</Label>
                  <select
                    id="exam-status"
                    value={String(form.status ?? 'ACTIVE')}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">Pasif</option>
                    <option value="ARCHIVED">Arşiv</option>
                  </select>
                </div>
              </>
            ) : null}
            {modal &&
            (modal.type === 'section' || modal.type === 'subject' || modal.type === 'topic') ? (
              <div className="space-y-2">
                <Label htmlFor="exam-order">Sıra</Label>
                <Input
                  id="exam-order"
                  type="number"
                  min={0}
                  value={Number(form.order ?? 0)}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))
                  }
                />
              </div>
            ) : null}
            {modal?.type === 'topic' ? (
              <div className="space-y-2">
                <Label htmlFor="exam-qcount">Soru dağılımı (sınavda kaç soru)</Label>
                <Input
                  id="exam-qcount"
                  type="number"
                  min={0}
                  value={
                    form.examQuestionCount === '' || form.examQuestionCount == null
                      ? ''
                      : form.examQuestionCount
                  }
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      examQuestionCount:
                        e.target.value === '' ? '' : parseInt(e.target.value, 10),
                    }))
                  }
                  placeholder="Boş bırakılabilir"
                />
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              İptal
            </Button>
            <Button type="button" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {modal?.edit ? 'Kaydet' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
