/**
 * Deneme popülasyonu: bölüm bazlı ortalama ve standart sapma (μ, σ)
 */

import type { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { standardDeviation } from './osymCore';
import type { SectionGroupDef } from './examScoringConfig';

type BreakdownRow = {
  subjectId: string;
  right?: number;
  wrong?: number;
  net?: number;
};

export type SectionPopulationStats = Record<
  string,
  { mean: number; std: number; sampleSize: number }
>;

export async function loadSectionPopulationStats(
  prisma: PrismaClient,
  examId: string,
  sectionGroups: SectionGroupDef[],
): Promise<SectionPopulationStats | null> {
  if (sectionGroups.length === 0) return null;

  const sections = await prisma.section.findMany({
    where: { examId },
    include: { subjects: { select: { id: true } } },
  });

  const subjectToSection = new Map<string, string>();
  for (const sec of sections) {
    for (const sub of sec.subjects) {
      subjectToSection.set(sub.id, sec.code);
    }
  }

  const attempts = await prisma.examAttempt.findMany({
    where: { examId, deletedAt: null, breakdown: { not: Prisma.DbNull } },
    select: { breakdown: true },
  });

  const netsByKey: Record<string, number[]> = {};
  for (const g of sectionGroups) {
    netsByKey[g.key] = [];
  }

  for (const a of attempts) {
    const raw = a.breakdown as BreakdownRow[] | null;
    if (!Array.isArray(raw) || raw.length === 0) continue;

    for (const group of sectionGroups) {
      const codeSet = new Set(group.sectionCodes);
      let net = 0;
      for (const item of raw) {
        const secCode = subjectToSection.get(item.subjectId);
        if (!secCode || !codeSet.has(secCode)) continue;
        const itemNet =
          typeof item.net === 'number'
            ? item.net
            : (item.right ?? 0) - (item.wrong ?? 0) / 4;
        net += itemNet;
      }
      netsByKey[group.key].push(net);
    }
  }

  const sampleSize = attempts.length;
  if (sampleSize === 0) return null;

  const result: SectionPopulationStats = {};
  for (const group of sectionGroups) {
    const nets = netsByKey[group.key];
    if (nets.length === 0) {
      result[group.key] = {
        mean: group.defaultMean,
        std: group.defaultStd,
        sampleSize: 0,
      };
      continue;
    }
    const mean = nets.reduce((s, x) => s + x, 0) / nets.length;
    const std = nets.length > 1 ? standardDeviation(nets) : group.defaultStd;
    result[group.key] = {
      mean: Math.round(mean * 100) / 100,
      std: Math.round(Math.max(std, 0.5) * 100) / 100,
      sampleSize: nets.length,
    };
  }

  return result;
}
