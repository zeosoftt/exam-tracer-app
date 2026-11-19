/**
 * Sınav müfredatlarını (prisma/curriculum/catalog) veritabanına yükler.
 *
 *   npx tsx scripts/load-curriculum.ts            # önizleme — hiçbir şey yazmaz
 *   npx tsx scripts/load-curriculum.ts --apply    # uygular
 *   npx tsx scripts/load-curriculum.ts --only=KPSS,YKS_TYT
 *
 * DİKKAT: DATABASE_URL hangi veritabanını gösteriyorsa ona yazar (.env).
 */

import { PrismaClient } from '@prisma/client';
import { CATALOG_CLEANUP, CATALOG_EXAMS } from '../prisma/curriculum/catalog';
import { cleanupDuplicateTopics, loadCatalog } from '../prisma/curriculum/loadCatalog';

async function main() {
  const apply = process.argv.includes('--apply');
  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const only = onlyArg ? new Set(onlyArg.slice('--only='.length).split(',').map((s) => s.trim())) : null;
  const exams = only ? CATALOG_EXAMS.filter((e) => only.has(e.code)) : CATALOG_EXAMS;
  const cleanup = only ? CATALOG_CLEANUP.filter(([e]) => only.has(e)) : CATALOG_CLEANUP;

  const dbHost = (process.env.DATABASE_URL ?? '').replace(/^.*@/, '').replace(/[/?].*$/, '');
  console.log(`\n=== Müfredat yükleme — ${apply ? 'UYGULA' : 'ÖNİZLEME (yazma yok)'} ===`);
  console.log(`Veritabanı: ${dbHost || '(DATABASE_URL yok)'}`);
  console.log(`Sınav sayısı: ${exams.length}\n`);

  const prisma = new PrismaClient();
  try {
    const reports = await loadCatalog(prisma, exams, { apply, log: (l) => console.log(l) });
    const cleanupReport = await cleanupDuplicateTopics(prisma, cleanup, { apply });

    const sum = (k: 'sectionsCreated' | 'subjectsCreated' | 'topicsCreated' | 'topicsTotal' | 'reordered') =>
      reports.reduce((n, r) => n + r[k], 0);

    console.log('\n--- Özet ---');
    console.log(`Yeni sınav: ${reports.filter((r) => r.examCreated).map((r) => r.examCode).join(', ') || '-'}`);
    console.log(`Aktifleştirilen: ${reports.filter((r) => r.examActivated).map((r) => r.examCode).join(', ') || '-'}`);
    console.log(`Yeni bölüm: ${sum('sectionsCreated')} · yeni ders: ${sum('subjectsCreated')} · yeni konu: ${sum('topicsCreated')}`);
    console.log(`Katalogdaki toplam konu: ${sum('topicsTotal')} · sırası güncellenen: ${sum('reordered')}`);

    const renamed = reports.flatMap((r) => r.renamed.map((x) => `${r.examCode} ${x}`));
    if (renamed.length) console.log(`\nAd düzeltmeleri (${renamed.length}):\n  ${renamed.join('\n  ')}`);
    const restored = reports.flatMap((r) => r.restored.map((x) => `${r.examCode} ${x}`));
    if (restored.length) console.log(`\nGeri açılan: \n  ${restored.join('\n  ')}`);

    console.log(`\nGizlenen tekrar konular (ilerlemesi yok): ${cleanupReport.hidden.length}`);
    for (const p of cleanupReport.hidden) console.log(`  - ${p}`);
    if (cleanupReport.skippedWithProgress.length) {
      console.log(`\nİlerlemesi olduğu için dokunulmayanlar: ${cleanupReport.skippedWithProgress.length}`);
      for (const s of cleanupReport.skippedWithProgress) console.log(`  - ${s.path} (${s.progressRows} kayıt)`);
    }
    if (cleanupReport.notFound.length) console.log(`\nBulunamayan temizlik girdisi: ${cleanupReport.notFound.join(', ')}`);

    if (!apply) console.log('\nUygulamak için: npx tsx scripts/load-curriculum.ts --apply');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
