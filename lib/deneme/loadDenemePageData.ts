/**
 * Deneme sayfası — sunucu tarafı ilk veri (LCP / Speed Index).
 * Konu ilerlemesi istemcide arka planda yüklenir (ağır sorgu atlanır).
 */

import { prisma } from '@/lib/db/prisma';
import { userCanAccessDenemeDetail } from '@/lib/deneme/denemeAccess';
import {
  listUserDenemeAttempts,
  mapDenemeAttemptToDto,
  type DenemeAttemptDto,
} from '@/lib/deneme/denemeRepository';
import { findUserSettings } from '@/lib/settings/settingsRepository';
import { isDenemeAdvancedEnabled } from '@/lib/siteSettings';

export type DenemePageInitialData = {
  denemeAdvanced: boolean;
  canViewDenemeDetail: boolean;
  attempts: DenemeAttemptDto[];
  topicProgressByExam: Record<string, { completed: number; total: number; pct: number }>;
  primaryTopicProgress: {
    examId: string;
    examName: string | null;
    completed: number;
    total: number;
    pct: number;
  } | null;
  exams: Array<{ id: string; name: string; code: string }>;
  activeExamId: string | null;
};

export async function loadDenemePageData(userId: string): Promise<DenemePageInitialData> {
  const [denemeAdvanced, canViewDenemeDetail, exams, settings, attemptsBundle] = await Promise.all([
    isDenemeAdvancedEnabled(),
    userCanAccessDenemeDetail(userId),
    prisma.exam.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    }),
    findUserSettings(userId),
    listUserDenemeAttempts(userId, { limit: 50, skip: 0 }),
  ]);

  const activeExamId = settings?.activeExam?.id ?? null;

  if (!denemeAdvanced) {
    return {
      denemeAdvanced: false,
      canViewDenemeDetail,
      attempts: [],
      topicProgressByExam: {},
      primaryTopicProgress: null,
      exams,
      activeExamId,
    };
  }

  return {
    denemeAdvanced: true,
    canViewDenemeDetail,
    attempts: attemptsBundle.attempts.map(mapDenemeAttemptToDto),
    topicProgressByExam: {},
    primaryTopicProgress: null,
    exams,
    activeExamId,
  };
}
