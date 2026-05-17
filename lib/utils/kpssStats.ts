/**
 * KPSS GY/GK popülasyon istatistikleri (geriye dönük API uyumluluğu)
 */

import type { PrismaClient } from '@prisma/client';
import { getExamScoringProfile } from '@/lib/scoring/examScoringConfig';
import { loadSectionPopulationStats } from '@/lib/scoring/populationStats';

export interface KpssPopulationStats {
  gyMean: number;
  gyStd: number;
  gkMean: number;
  gkStd: number;
  sampleSize: number;
}

/** KPSS sınavı için GY/GK bölüm subject ID'leri */
export async function getKpssSectionSubjectIds(
  prisma: PrismaClient,
  examId: string,
): Promise<{ GY: string[]; GK: string[] } | null> {
  const sections = await prisma.section.findMany({
    where: { examId, code: { in: ['GENEL_YETENEK', 'GENEL_KULTUR'] } },
    include: { subjects: { select: { id: true } } },
  });
  const gy = sections.find((s) => s.code === 'GENEL_YETENEK');
  const gk = sections.find((s) => s.code === 'GENEL_KULTUR');
  if (!gy || !gk) return null;
  return {
    GY: gy.subjects.map((s) => s.id),
    GK: gk.subjects.map((s) => s.id),
  };
}

/** Veritabanındaki KPSS denemelerinden μ ve σ hesapla */
export async function getKpssPopulationStats(
  prisma: PrismaClient,
  examId: string,
): Promise<KpssPopulationStats | null> {
  const profile = getExamScoringProfile('KPSS');
  const stats = await loadSectionPopulationStats(prisma, examId, profile.sectionGroups);
  if (!stats) return null;

  const gy = stats.GY;
  const gk = stats.GK;
  if (!gy || !gk) return null;

  const sampleSize = Math.max(gy.sampleSize, gk.sampleSize);

  return {
    gyMean: gy.mean,
    gyStd: gy.std,
    gkMean: gk.mean,
    gkStd: gk.std,
    sampleSize,
  };
}
