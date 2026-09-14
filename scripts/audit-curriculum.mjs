/**
 * Müfredat seed sonrası konu sayısı özeti (read-only).
 * Kullanım: npx tsx scripts/audit-curriculum.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const exams = await prisma.exam.findMany({
    where: { deletedAt: null },
    orderBy: { code: 'asc' },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          subjects: {
            orderBy: { order: 'asc' },
            include: {
              _count: { select: { topics: true } },
            },
          },
        },
      },
    },
  });

  let totalTopics = 0;
  console.log('\n=== Sınav Müfredat Özeti ===\n');
  for (const exam of exams) {
    let examTopics = 0;
    console.log(`${exam.code} — ${exam.name}`);
    for (const section of exam.sections) {
      for (const subject of section.subjects) {
        const count = subject._count.topics;
        examTopics += count;
        console.log(`  ${section.code} / ${subject.code}: ${count} konu`);
      }
    }
    totalTopics += examTopics;
    console.log(`  → Toplam: ${examTopics} konu\n`);
  }
  console.log(`GENEL TOPLAM: ${totalTopics} konu, ${exams.length} sınav\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
