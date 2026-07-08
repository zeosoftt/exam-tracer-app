import { prisma } from '@/lib/db/prisma';
import {
  institutionSourceUrlMatches,
  normalizeInstitutionSourceUrl,
} from '@/lib/deneme/institutionResult/normalizeSourceUrl';
import type { InstitutionResultImport } from '@/lib/deneme/institutionResult/types';

function buildImportFingerprint(importData: InstitutionResultImport): string {
  return [
    importData.sourceHost.toLowerCase(),
    importData.examName.trim().toLocaleLowerCase('tr-TR'),
    importData.examDate ?? '',
    importData.examNumber ?? '',
  ].join('|');
}

function extractSourceUrlFromNotes(notes: string | null): string | null {
  if (!notes) return null;
  const match = notes.match(/^Kurum sonucu:\s*(.+)$/m);
  return match?.[1]?.trim() ?? null;
}

export async function assertNotDuplicateImport(
  userId: string,
  importData: InstitutionResultImport,
): Promise<void> {
  const normalizedUrl = normalizeInstitutionSourceUrl(importData.sourceUrl);
  const fingerprint = buildImportFingerprint(importData);

  const existingAttempts = await prisma.examAttempt.findMany({
    where: {
      userId,
      deletedAt: null,
      notes: { contains: 'Kurum sonucu:' },
    },
    select: { id: true, notes: true },
    take: 200,
    orderBy: { createdAt: 'desc' },
  });

  for (const attempt of existingAttempts) {
    const storedUrl = extractSourceUrlFromNotes(attempt.notes);
    if (storedUrl && institutionSourceUrlMatches(storedUrl, normalizedUrl)) {
      throw new Error('Bu deneme sonucu zaten kayıtlı.');
    }

    if (attempt.notes?.includes(fingerprint)) {
      throw new Error('Bu deneme sonucu zaten kayıtlı.');
    }
  }
}

export function buildImportNotes(importData: InstitutionResultImport): string {
  const fingerprint = buildImportFingerprint(importData);
  const lines = [
    `Kurum sonucu: ${normalizeInstitutionSourceUrl(importData.sourceUrl)}`,
    `Deneme anahtarı: ${fingerprint}`,
    importData.institution ? `Kurum: ${importData.institution}` : null,
    importData.examNumber ? `Deneme no: ${importData.examNumber}` : null,
    `Kaynak: ${importData.sourceHost}`,
  ].filter(Boolean);
  return lines.join('\n');
}
