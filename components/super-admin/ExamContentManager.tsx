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
  CalendarDays,
} from 'lucide-react';
import { useExamContentManager } from '@/components/super-admin/hooks/useExamContentManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AdminPageHeader } from '@/components/super-admin/layout/AdminPageHeader';
import { AdminErrorAlert } from '@/components/super-admin/layout/AdminErrorAlert';
import { ADMIN_NAV_ITEMS } from '@/components/super-admin/layout/adminNav';

const nav = ADMIN_NAV_ITEMS.find((i) => i.href.endsWith('/exam-content'));

const ENTITY_LABEL = {
  exam: 'sınav',
  section: 'bölüm',
  subject: 'ders',
  topic: 'konu',
} as const;

const CHILD_LABEL = {
  exam: 'bölüm',
  section: 'ders',
  subject: 'konu',
} as const;

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Aktif',
  INACTIVE: 'Pasif',
  ARCHIVED: 'Arşiv',
};

function ExpandToggle({
  expanded,
  onClick,
  label,
  size = 'md',
}: {
  expanded: boolean;
  onClick: () => void;
  label: string;
  size?: 'sm' | 'md';
}) {
  const Icon = expanded ? ChevronDown : ChevronRight;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={size === 'md' ? 'h-7 w-7 shrink-0' : 'h-6 w-6 shrink-0'}
      onClick={onClick}
      aria-expanded={expanded}
      aria-label={`${label}: ${expanded ? 'daralt' : 'genişlet'}`}
    >
      <Icon className={size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'} aria-hidden />
    </Button>
  );
}

function RowActions({
  name,
  onEdit,
  onDelete,
  deleting,
  onAddChild,
  childLabel,
  size = 'md',
}: {
  name: string;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
  onAddChild?: () => void;
  childLabel?: string;
  size?: 'sm' | 'md';
}) {
  const btn = size === 'md' ? 'h-8 w-8' : 'h-7 w-7';
  const icon = size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3';
  return (
    <div className="ml-auto flex shrink-0 items-center gap-0.5" role="group" aria-label={`${name} işlemleri`}>
      {onAddChild && childLabel ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(btn, 'text-primary hover:text-primary')}
          onClick={onAddChild}
          title={`${childLabel} ekle`}
          aria-label={`${name} altına ${childLabel} ekle`}
        >
          <Plus className={icon} aria-hidden />
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={btn}
        onClick={onEdit}
        title="Düzenle"
        aria-label={`${name} düzenle`}
      >
        <Pencil className={icon} aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(btn, 'text-destructive hover:bg-destructive/10 hover:text-destructive')}
        onClick={onDelete}
        disabled={deleting}
        title="Sil"
        aria-label={`${name} sil`}
      >
        {deleting ? (
          <Loader2 className={cn(icon, 'animate-spin')} aria-hidden />
        ) : (
          <Trash2 className={icon} aria-hidden />
        )}
      </Button>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{children}</span>
  );
}

function EmptyHint({ children }: { children: string }) {
  return <p className="px-2 py-2 text-xs text-muted-foreground">{children}</p>;
}

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
  } = useExamContentManager();

  const modalTitle = modal
    ? `${modal.edit ? '' : 'Yeni '}${ENTITY_LABEL[modal.type]}${modal.edit ? ' düzenle' : ''}`
        .replace(/^./, (c) => c.toUpperCase())
    : '';

  const modalDescription = modal
    ? modal.edit
      ? 'Değişiklikler kaydedildiğinde ağaç yenilenir.'
      : modal.type === 'exam'
        ? 'Sınav kodu kullanıcıya görünür; kısa ve büyük harf tercih edin.'
        : `Yeni ${ENTITY_LABEL[modal.type]} seçili öğenin altına eklenir.`
    : '';

  const canSave = Boolean(String(form.name ?? '').trim() && String(form.code ?? '').trim());

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={nav?.title ?? 'Sınav & İçerik'}
        description={nav?.description}
        actions={
          <Button type="button" onClick={() => openAdd('exam')} disabled={loading}>
            <Plus className="h-4 w-4" aria-hidden />
            Yeni sınav
          </Button>
        }
      />

      {actionError && !modal ? (
        <AdminErrorAlert message={actionError} onDismiss={() => setActionError(null)} />
      ) : null}

      {error ? (
        <AdminErrorAlert message={error} onRetry={() => void fetchTree()} retrying={loading} />
      ) : null}

      {loading ? (
        <Card>
          <CardContent className="space-y-px p-0" role="status" aria-busy="true" aria-label="Yükleniyor">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <Skeleton className="h-6 w-6 rounded-md" />
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="ml-auto h-5 w-14 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : error ? null : exams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen className="h-6 w-6" aria-hidden />
            </span>
            <div className="space-y-1">
              <p className="font-medium">Henüz sınav yok</p>
              <p className="text-sm text-muted-foreground">
                İlk sınavı ekleyin; ardından bölüm, ders ve konuları altına yerleştirin.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => openAdd('exam')}>
              <Plus className="h-4 w-4" aria-hidden />
              Yeni sınav
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {exams.map((exam) => {
                const examOpen = expandedExam.has(exam.id);
                return (
                  <li key={exam.id}>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 bg-muted/40 px-3 py-2.5 sm:px-4">
                      <ExpandToggle
                        expanded={examOpen}
                        onClick={() => toggleExam(exam.id)}
                        label={exam.name}
                      />
                      <BookOpen className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span className="min-w-0 flex-1 truncate font-semibold sm:flex-none">
                        {exam.name}
                      </span>
                      <div className="flex min-w-0 flex-1 basis-full items-center gap-2 pl-[3.75rem] sm:basis-0 sm:pl-0">
                        <Code>{exam.code}</Code>
                        <Badge variant={exam.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {STATUS_LABEL[exam.status] ?? exam.status}
                        </Badge>
                        <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                          {exam.startDate ? (
                            <time dateTime={String(exam.startDate).slice(0, 10)} className="tabular-nums">
                              {new Date(exam.startDate).toLocaleDateString('tr-TR')}
                            </time>
                          ) : (
                            'Tarih yok'
                          )}
                        </span>
                        <RowActions
                          name={exam.name}
                          onEdit={() => openEdit('exam', exam)}
                          onDelete={() => remove('exam', exam.id)}
                          deleting={deletingId === exam.id}
                          onAddChild={() => openAdd('section', exam.id)}
                          childLabel={CHILD_LABEL.exam}
                        />
                      </div>
                    </div>

                    {examOpen ? (
                      <div className="space-y-2 px-3 py-3 sm:pl-10 sm:pr-4">
                        {exam.sections.length === 0 ? (
                          <EmptyHint>Bölüm yok. Satırdaki + ile ekleyin.</EmptyHint>
                        ) : (
                          exam.sections.map((section) => {
                            const sectionOpen = expandedSection.has(section.id);
                            return (
                              <div key={section.id} className="rounded-lg border bg-card">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-2 py-1.5 sm:px-3">
                                  <ExpandToggle
                                    expanded={sectionOpen}
                                    onClick={() => toggleSection(section.id)}
                                    label={section.name}
                                    size="sm"
                                  />
                                  <Layers
                                    className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400"
                                    aria-hidden
                                  />
                                  <span className="min-w-0 flex-1 truncate text-sm font-medium sm:flex-none">
                                    {section.name}
                                  </span>
                                  <div className="flex min-w-0 flex-1 basis-full items-center gap-2 pl-[3.375rem] sm:basis-0 sm:pl-0">
                                    <Code>{section.code}</Code>
                                    <RowActions
                                      name={section.name}
                                      size="sm"
                                      onEdit={() => openEdit('section', section)}
                                      onDelete={() => remove('section', section.id)}
                                      deleting={deletingId === section.id}
                                      onAddChild={() => openAdd('subject', section.id)}
                                      childLabel={CHILD_LABEL.section}
                                    />
                                  </div>
                                </div>

                                {sectionOpen ? (
                                  <div className="space-y-1.5 px-2 pb-2 sm:pl-8">
                                    {section.subjects.length === 0 ? (
                                      <EmptyHint>Ders yok. Satırdaki + ile ekleyin.</EmptyHint>
                                    ) : (
                                      section.subjects.map((subject) => {
                                        const subjectOpen = expandedSubject.has(subject.id);
                                        const reordering = reorderingSubjectId === subject.id;
                                        return (
                                          <div key={subject.id} className="rounded-md border bg-muted/30">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-2 py-1.5">
                                              <ExpandToggle
                                                expanded={subjectOpen}
                                                onClick={() => toggleSubject(subject.id)}
                                                label={subject.name}
                                                size="sm"
                                              />
                                              <FileText
                                                className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                                                aria-hidden
                                              />
                                              <span className="min-w-0 flex-1 truncate text-sm font-medium sm:flex-none">
                                                {subject.name}
                                              </span>
                                              <div className="flex min-w-0 flex-1 basis-full items-center gap-2 pl-[3.375rem] sm:basis-0 sm:pl-0">
                                                <Code>{subject.code}</Code>
                                                {subject.topics.length > 0 ? (
                                                  <span className="whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                                                    {subject.topics.length} konu
                                                  </span>
                                                ) : null}
                                                <RowActions
                                                  name={subject.name}
                                                  size="sm"
                                                  onEdit={() => openEdit('subject', subject)}
                                                  onDelete={() => remove('subject', subject.id)}
                                                  deleting={deletingId === subject.id}
                                                  onAddChild={() => openAdd('topic', subject.id)}
                                                  childLabel={CHILD_LABEL.subject}
                                                />
                                              </div>
                                            </div>

                                            {subjectOpen ? (
                                              <div
                                                className={cn(
                                                  'space-y-0.5 px-2 pb-1.5 sm:pl-7',
                                                  reordering && 'pointer-events-none opacity-60',
                                                )}
                                                aria-busy={reordering || undefined}
                                              >
                                                {subject.topics.length === 0 ? (
                                                  <EmptyHint>Konu yok. Satırdaki + ile ekleyin.</EmptyHint>
                                                ) : (
                                                  <>
                                                    <p className="sr-only">
                                                      Konuları sürükleyip bırakarak sıralayabilirsiniz.
                                                    </p>
                                                    {subject.topics.map((topic) => (
                                                      <div
                                                        key={topic.id}
                                                        data-topic-id={topic.id}
                                                        draggable
                                                        onDragStart={(e) => handleTopicDragStart(e, topic.id)}
                                                        onDragOver={handleTopicDragOver}
                                                        onDrop={(e) => handleTopicDrop(e, subject, topic.id)}
                                                        onDragEnd={handleTopicDragEnd}
                                                        className={cn(
                                                          'flex flex-wrap items-center gap-x-2 gap-y-1 rounded px-2 py-1 transition-colors hover:bg-muted',
                                                          'cursor-grab active:cursor-grabbing',
                                                          draggedTopicId === topic.id && 'opacity-50',
                                                        )}
                                                      >
                                                        <GripVertical
                                                          className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70"
                                                          aria-hidden
                                                        />
                                                        <FolderOpen
                                                          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                                                          aria-hidden
                                                        />
                                                        <span className="min-w-0 flex-1 truncate text-sm sm:flex-none">
                                                          {topic.name}
                                                        </span>
                                                        <div className="flex min-w-0 flex-1 basis-full items-center gap-2 pl-11 sm:basis-0 sm:pl-0">
                                                          <Code>{topic.code}</Code>
                                                          {topic.examQuestionCount != null ? (
                                                            <Badge
                                                              variant="outline"
                                                              className="h-5 whitespace-nowrap px-1.5 text-[11px] font-medium tabular-nums text-primary"
                                                            >
                                                              {topic.examQuestionCount} soru
                                                            </Badge>
                                                          ) : null}
                                                          <RowActions
                                                            name={topic.name}
                                                            size="sm"
                                                            onEdit={() => openEdit('topic', topic)}
                                                            onDelete={() => remove('topic', topic.id)}
                                                            deleting={deletingId === topic.id}
                                                          />
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </>
                                                )}
                                              </div>
                                            ) : null}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog open={Boolean(modal)} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!saving && canSave) void save();
            }}
            className="space-y-4"
          >
            <DialogHeader>
              <DialogTitle>{modalTitle}</DialogTitle>
              <DialogDescription>{modalDescription}</DialogDescription>
            </DialogHeader>

            {actionError ? (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {actionError}
              </p>
            ) : null}

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="exam-name">Ad</Label>
                <Input
                  id="exam-name"
                  type="text"
                  autoFocus
                  required
                  value={String(form.name ?? '')}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam-code">Kod</Label>
                <Input
                  id="exam-code"
                  type="text"
                  required
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono uppercase"
                  value={String(form.code ?? '')}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  placeholder={modal?.type === 'exam' ? 'KPSS' : 'örn: MAT'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam-desc">
                  Açıklama <span className="font-normal text-muted-foreground">(opsiyonel)</span>
                </Label>
                <Input
                  id="exam-desc"
                  type="text"
                  value={String(form.description ?? '')}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              {modal?.type === 'exam' ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="exam-date">Sınav tarihi</Label>
                    <Input
                      id="exam-date"
                      type="date"
                      value={String(form.startDate ?? '')}
                      onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value || '' }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exam-status">Durum</Label>
                    <select
                      id="exam-status"
                      value={String(form.status ?? 'ACTIVE')}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="ACTIVE">Aktif</option>
                      <option value="INACTIVE">Pasif</option>
                      <option value="ARCHIVED">Arşiv</option>
                    </select>
                  </div>
                  <p className="text-xs text-muted-foreground sm:col-span-2">
                    Tarih girilirse kullanıcı panosunda &quot;Sınava X gün kaldı&quot; gösterilir.
                  </p>
                </div>
              ) : null}

              {modal && modal.type !== 'exam' ? (
                <div className={cn('grid gap-3', modal.type === 'topic' && 'sm:grid-cols-2')}>
                  <div className="space-y-2">
                    <Label htmlFor="exam-order">Sıra</Label>
                    <Input
                      id="exam-order"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={Number(form.order ?? 0)}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))
                      }
                    />
                  </div>
                  {modal.type === 'topic' ? (
                    <div className="space-y-2">
                      <Label htmlFor="exam-qcount">Sınavdaki soru sayısı</Label>
                      <Input
                        id="exam-qcount"
                        type="number"
                        inputMode="numeric"
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
              ) : null}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>
                İptal
              </Button>
              <Button type="submit" disabled={saving || !canSave}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                {modal?.edit ? 'Kaydet' : 'Ekle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
