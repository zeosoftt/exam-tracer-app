/**
 * KPSS GY/GK ortalama ve standart sapma — veritabanından tüm kullanıcı denemeleriyle hesaplanır
 */

import type { PrismaClient } from '@prisma/client';
import { standardDeviation } from './denemeScore';

type BreakdownItem = { subjectId: string; right: number; wrong: number; empty?: number; net?: number };

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
  examId: string
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
  examId: string
): Promise<KpssPopulationStats | null> {
  const sectionIds = await getKpssSectionSubjectIds(prisma, examId);
  if (!sectionIds) return null;

  const gySet = new Set(sectionIds.GY);
  const gkSet = new Set(sectionIds.GK);

  const attempts = await prisma.examAttempt.findMany({
    where: { examId, deletedAt: null, breakdown: { not: null } },
    select: { breakdown: true },
  });

  const gyNets: number[] = [];
  const gkNets: number[] = [];

  for (const a of attempts) {
    const raw = a.breakdown as BreakdownItem[] | null;
    if (!Array.isArray(raw) || raw.length === 0) continue;
    let gyNet = 0;
    let gkNet = 0;
    for (const item of raw) {
      const net = typeof item.net === 'number' ? item.net : item.right - (item.wrong ?? 0) / 4;
      if (gySet.has(item.subjectId)) gyNet += net;
      else if (gkSet.has(item.subjectId)) gkNet += net;
    }
    gyNets.push(gyNet);
    gkNets.push(gkNet);
  }

  const N = gyNets.length;
  if (N === 0) return null;

  const gyMean = gyNets.reduce((s, x) => s + x, 0) / N;
  const gkMean = gkNets.reduce((s, x) => s + x, 0) / N;
  const gyStd = N > 1 ? standardDeviation(gyNets) : 10;
  const gkStd = N > 1 ? standardDeviation(gkNets) : 10;

  return {
    gyMean: Math.round(gyMean * 100) / 100,
    gyStd: Math.round(gyStd * 100) / 100,
    gkMean: Math.round(gkMean * 100) / 100,
    gkStd: Math.round(gkStd * 100) / 100,
    sampleSize: N,
  };
}
