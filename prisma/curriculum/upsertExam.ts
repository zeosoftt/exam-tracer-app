import type { PrismaClient } from '@prisma/client';
import type { CurriculumExam } from './types';

/** Tek sınav ağacını idempotent upsert eder */
export async function upsertExamTree(prisma: PrismaClient, exam: CurriculumExam): Promise<void> {
  const record = await prisma.exam.upsert({
    where: { code: exam.code },
    update: {
      name: exam.name,
      description: exam.description,
      status: 'ACTIVE',
    },
    create: {
      code: exam.code,
      name: exam.name,
      description: exam.description,
      status: 'ACTIVE',
    },
  });

  for (let si = 0; si < exam.sections.length; si++) {
    const section = exam.sections[si];
    const sectionRecord = await prisma.section.upsert({
      where: { examId_code: { examId: record.id, code: section.code } },
      update: { name: section.name, order: si + 1 },
      create: {
        examId: record.id,
        code: section.code,
        name: section.name,
        order: si + 1,
      },
    });

    for (let subi = 0; subi < section.subjects.length; subi++) {
      const subject = section.subjects[subi];
      const subjectRecord = await prisma.subject.upsert({
        where: { sectionId_code: { sectionId: sectionRecord.id, code: subject.code } },
        update: { name: subject.name, order: subi + 1 },
        create: {
          sectionId: sectionRecord.id,
          code: subject.code,
          name: subject.name,
          order: subi + 1,
        },
      });

      for (let ti = 0; ti < subject.topics.length; ti++) {
        const topic = subject.topics[ti];
        await prisma.topic.upsert({
          where: { subjectId_code: { subjectId: subjectRecord.id, code: topic.code } },
          update: {
            name: topic.name,
            order: ti + 1,
            ...(topic.examQuestionCount != null ? { examQuestionCount: topic.examQuestionCount } : {}),
          },
          create: {
            subjectId: subjectRecord.id,
            code: topic.code,
            name: topic.name,
            order: ti + 1,
            ...(topic.examQuestionCount != null ? { examQuestionCount: topic.examQuestionCount } : {}),
          },
        });
      }
    }
  }
}

export async function upsertExamTrees(prisma: PrismaClient, exams: CurriculumExam[]): Promise<void> {
  for (const exam of exams) {
    await upsertExamTree(prisma, exam);
    console.log(`  ✓ ${exam.code}`);
  }
}
