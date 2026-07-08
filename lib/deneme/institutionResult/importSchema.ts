import { z } from 'zod';

const institutionSubjectSchema = z.object({
  name: z.string(),
  questionCount: z.number(),
  right: z.number(),
  wrong: z.number(),
  empty: z.number(),
  net: z.number(),
});

export const institutionResultImportSchema = z.object({
  sourceUrl: z.string().url(),
  sourceHost: z.string(),
  platform: z.enum(['verisayar', 'unknown']),
  examName: z.string(),
  examDate: z.string().nullable(),
  examNumber: z.string().nullable(),
  institution: z.string().nullable(),
  studentName: z.string().nullable(),
  subjects: z.array(institutionSubjectSchema).min(1),
  sectionTotals: z.object({
    generalAbility: z
      .object({
        questionCount: z.number(),
        right: z.number(),
        wrong: z.number(),
        net: z.number(),
      })
      .nullable(),
    generalCulture: z
      .object({
        questionCount: z.number(),
        right: z.number(),
        wrong: z.number(),
        net: z.number(),
      })
      .nullable(),
  }),
  scores: z.array(
    z.object({
      type: z.string(),
      score: z.number(),
      rankKurum: z.number().nullable(),
      rankNational: z.number().nullable(),
    }),
  ),
  topics: z.array(
    z.object({
      subjectName: z.string(),
      topicName: z.string(),
      questionCount: z.number(),
      right: z.number(),
      wrong: z.number(),
      empty: z.number(),
      successRate: z.number(),
    }),
  ),
  totals: z.object({
    right: z.number(),
    wrong: z.number(),
    empty: z.number(),
    net: z.number(),
    questionCount: z.number(),
  }),
});
