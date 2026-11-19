/**
 * Müfredat kataloğunu veritabanına güvenli şekilde uygular.
 *
 * Kurallar:
 * - Eşleşme her seviyede `code` ile yapılır; mevcut satırların id'si değişmez
 *   (user_progress / exam_attempts ilişkileri korunur).
 * - Hiçbir satır kalıcı silinmez. Katalogda olmayan mevcut konulara dokunulmaz.
 * - Temizlik listesi yalnızca kullanıcı ilerlemesi olmayan konuları gizler (deletedAt).
 * - Tekrar çalıştırmak güvenlidir (idempotent).
 */

import type { PrismaClient } from '@prisma/client';
import type { CatalogExam } from './catalog/dsl';
import { validateCatalog } from './catalog/dsl';

type Row = { id: string; code: string; name: string; order: number; deletedAt: Date | null };

export type CatalogPlanReport = {
  examCode: string;
  examCreated: boolean;
  examActivated: boolean;
  sectionsCreated: number;
  subjectsCreated: number;
  topicsCreated: number;
  topicsTotal: number;
  renamed: string[];
  restored: string[];
  reordered: number;
};

export type CleanupReport = {
  hidden: string[];
  skippedWithProgress: Array<{ path: string; progressRows: number }>;
  notFound: string[];
};

export type LoadOptions = { apply: boolean; log?: (line: string) => void };

function needsUpdate(row: Row, name: string, order: number) {
  return { rename: row.name !== name, reorder: row.order !== order, restore: row.deletedAt !== null };
}

export async function loadCatalog(
  prisma: PrismaClient,
  exams: CatalogExam[],
  options: LoadOptions,
): Promise<CatalogPlanReport[]> {
  const errors = validateCatalog(exams);
  if (errors.length > 0) {
    throw new Error(`Katalog geçersiz:\n  ${errors.join('\n  ')}`);
  }

  const { apply } = options;
  const reports: CatalogPlanReport[] = [];

  for (const exam of exams) {
    const report: CatalogPlanReport = {
      examCode: exam.code,
      examCreated: false,
      examActivated: false,
      sectionsCreated: 0,
      subjectsCreated: 0,
      topicsCreated: 0,
      topicsTotal: 0,
      renamed: [],
      restored: [],
      reordered: 0,
    };

    const existingExam = await prisma.exam.findUnique({
      where: { code: exam.code },
      select: { id: true, name: true, description: true, status: true, deletedAt: true },
    });

    let examId = existingExam?.id ?? `__new_exam_${exam.code}`;
    if (!existingExam) {
      report.examCreated = true;
      if (apply) {
        const created = await prisma.exam.create({
          data: { code: exam.code, name: exam.name, description: exam.description, status: 'ACTIVE' },
          select: { id: true },
        });
        examId = created.id;
      }
    } else {
      const changes: Record<string, unknown> = {};
      if (existingExam.name !== exam.name) {
        changes.name = exam.name;
        report.renamed.push(`[sınav] "${existingExam.name}" → "${exam.name}"`);
      }
      if ((existingExam.description ?? '') !== exam.description) changes.description = exam.description;
      if (existingExam.status !== 'ACTIVE') {
        changes.status = 'ACTIVE';
        report.examActivated = true;
      }
      if (existingExam.deletedAt) {
        changes.deletedAt = null;
        report.restored.push(`[sınav] ${exam.code}`);
      }
      if (apply && Object.keys(changes).length > 0) {
        await prisma.exam.update({ where: { id: existingExam.id }, data: changes });
      }
    }

    const existingSections: Row[] = existingExam
      ? await prisma.section.findMany({
          where: { examId: existingExam.id },
          select: { id: true, code: true, name: true, order: true, deletedAt: true },
        })
      : [];
    const sectionByCode = new Map(existingSections.map((s) => [s.code, s]));

    for (let si = 0; si < exam.sections.length; si++) {
      const section = exam.sections[si];
      const sectionOrder = si + 1;
      const existingSection = sectionByCode.get(section.code);
      let sectionId = existingSection?.id ?? `__new_section_${section.code}`;

      if (!existingSection) {
        report.sectionsCreated++;
        if (apply) {
          const created = await prisma.section.create({
            data: { examId, code: section.code, name: section.name, order: sectionOrder },
            select: { id: true },
          });
          sectionId = created.id;
        }
      } else {
        const u = needsUpdate(existingSection, section.name, sectionOrder);
        if (u.rename) report.renamed.push(`[bölüm] "${existingSection.name}" → "${section.name}"`);
        if (u.restore) report.restored.push(`[bölüm] ${section.code}`);
        if (u.reorder) report.reordered++;
        if (apply && (u.rename || u.reorder || u.restore)) {
          await prisma.section.update({
            where: { id: existingSection.id },
            data: { name: section.name, order: sectionOrder, deletedAt: null },
          });
        }
      }

      const existingSubjects: Row[] = existingSection
        ? await prisma.subject.findMany({
            where: { sectionId: existingSection.id },
            select: { id: true, code: true, name: true, order: true, deletedAt: true },
          })
        : [];
      const subjectByCode = new Map(existingSubjects.map((s) => [s.code, s]));

      for (let bi = 0; bi < section.subjects.length; bi++) {
        const subject = section.subjects[bi];
        const subjectOrder = bi + 1;
        const existingSubject = subjectByCode.get(subject.code);
        let subjectId = existingSubject?.id ?? `__new_subject_${subject.code}`;

        if (!existingSubject) {
          report.subjectsCreated++;
          if (apply) {
            const created = await prisma.subject.create({
              data: { sectionId, code: subject.code, name: subject.name, order: subjectOrder },
              select: { id: true },
            });
            subjectId = created.id;
          }
        } else {
          const u = needsUpdate(existingSubject, subject.name, subjectOrder);
          if (u.rename) report.renamed.push(`[ders] "${existingSubject.name}" → "${subject.name}"`);
          if (u.restore) report.restored.push(`[ders] ${subject.code}`);
          if (u.reorder) report.reordered++;
          if (apply && (u.rename || u.reorder || u.restore)) {
            await prisma.subject.update({
              where: { id: existingSubject.id },
              data: { name: subject.name, order: subjectOrder, deletedAt: null },
            });
          }
        }

        const existingTopics: Row[] = existingSubject
          ? await prisma.topic.findMany({
              where: { subjectId: existingSubject.id },
              select: { id: true, code: true, name: true, order: true, deletedAt: true },
            })
          : [];
        const topicByCode = new Map(existingTopics.map((t) => [t.code, t]));
        const toCreate: Array<{ subjectId: string; code: string; name: string; order: number }> = [];

        for (let ti = 0; ti < subject.topics.length; ti++) {
          const topic = subject.topics[ti];
          const topicOrder = ti + 1;
          report.topicsTotal++;
          const existingTopic = topicByCode.get(topic.code);
          if (!existingTopic) {
            report.topicsCreated++;
            toCreate.push({ subjectId, code: topic.code, name: topic.name, order: topicOrder });
            continue;
          }
          const u = needsUpdate(existingTopic, topic.name, topicOrder);
          if (u.rename) report.renamed.push(`[konu] "${existingTopic.name}" → "${topic.name}"`);
          if (u.restore) report.restored.push(`[konu] ${subject.code}/${topic.code}`);
          if (u.reorder) report.reordered++;
          if (apply && (u.rename || u.reorder || u.restore)) {
            await prisma.topic.update({
              where: { id: existingTopic.id },
              data: { name: topic.name, order: topicOrder, deletedAt: null },
            });
          }
        }

        if (apply && toCreate.length > 0) {
          await prisma.topic.createMany({ data: toCreate, skipDuplicates: true });
        }
      }
    }

    reports.push(report);
    options.log?.(
      `${apply ? '✓' : '·'} ${exam.code}: +${report.sectionsCreated} bölüm, +${report.subjectsCreated} ders, +${report.topicsCreated} konu (katalogda ${report.topicsTotal})`,
    );
  }

  return reports;
}

export async function cleanupDuplicateTopics(
  prisma: PrismaClient,
  entries: Array<[string, string, string, string]>,
  options: LoadOptions,
): Promise<CleanupReport> {
  const report: CleanupReport = { hidden: [], skippedWithProgress: [], notFound: [] };

  for (const [examCode, sectionCode, subjectCode, topicCode] of entries) {
    const path = `${examCode}/${sectionCode}/${subjectCode}/${topicCode}`;
    const topic = await prisma.topic.findFirst({
      where: {
        code: topicCode,
        subject: { code: subjectCode, section: { code: sectionCode, exam: { code: examCode } } },
      },
      select: { id: true, deletedAt: true },
    });
    if (!topic) {
      report.notFound.push(path);
      continue;
    }
    if (topic.deletedAt) continue;

    const progressRows = await prisma.userProgress.count({ where: { topicId: topic.id } });
    if (progressRows > 0) {
      report.skippedWithProgress.push({ path, progressRows });
      continue;
    }

    report.hidden.push(path);
    if (options.apply) {
      await prisma.topic.update({ where: { id: topic.id }, data: { deletedAt: new Date() } });
    }
  }

  return report;
}
