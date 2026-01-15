/**
 * Zod Validation Schemas
 * Input validation for all endpoints
 */

import { z } from 'zod';
import { VALIDATION } from '@/config/constants';

// Common schemas
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(VALIDATION.EMAIL_MAX_LENGTH, `Email must be at most ${VALIDATION.EMAIL_MAX_LENGTH} characters`);

export const passwordSchema = z
  .string()
  .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
  .max(VALIDATION.PASSWORD_MAX_LENGTH, `Password must be at most ${VALIDATION.PASSWORD_MAX_LENGTH} characters`)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(VALIDATION.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`)
  .max(VALIDATION.NAME_MAX_LENGTH, `Name must be at most ${VALIDATION.NAME_MAX_LENGTH} characters`)
  .trim();

export const codeSchema = z
  .string()
  .min(VALIDATION.CODE_MIN_LENGTH, `Code must be at least ${VALIDATION.CODE_MIN_LENGTH} characters`)
  .max(VALIDATION.CODE_MAX_LENGTH, `Code must be at most ${VALIDATION.CODE_MAX_LENGTH} characters`)
  .regex(/^[A-Z0-9_-]+$/, 'Code must contain only uppercase letters, numbers, hyphens, and underscores')
  .trim();

export const descriptionSchema = z
  .string()
  .max(VALIDATION.DESCRIPTION_MAX_LENGTH, `Description must be at most ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters`)
  .trim()
  .optional();

export const notesSchema = z
  .string()
  .max(VALIDATION.NOTES_MAX_LENGTH, `Notes must be at most ${VALIDATION.NOTES_MAX_LENGTH} characters`)
  .trim()
  .optional();

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  institutionId: z.string().cuid().optional(),
  // Onboarding data
  targetScore: z.number().int().min(0).max(1000).optional(),
  dailyStudyHours: z.number().int().min(1).max(24).optional(),
  examCode: z.string().optional(),
  examName: z.string().optional(),
});

// User schemas
export const updateUserSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  role: z.enum(['ADMIN', 'INSTITUTION_ADMIN', 'INDIVIDUAL', 'VIEWER']).optional(),
  institutionId: z.string().cuid().optional(),
});

// Exam schemas
export const createExamSchema = z.object({
  name: nameSchema,
  code: codeSchema,
  description: descriptionSchema,
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate >= data.startDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const updateExamSchema = z.object({
  name: nameSchema.optional(),
  code: codeSchema.optional(),
  description: descriptionSchema,
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate >= data.startDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// Section schemas
export const createSectionSchema = z.object({
  examId: z.string().cuid(),
  name: nameSchema,
  code: codeSchema,
  description: descriptionSchema,
  order: z.number().int().min(0).default(0),
});

export const updateSectionSchema = z.object({
  name: nameSchema.optional(),
  code: codeSchema.optional(),
  description: descriptionSchema,
  order: z.number().int().min(0).optional(),
});

// Subject schemas
export const createSubjectSchema = z.object({
  sectionId: z.string().cuid(),
  name: nameSchema,
  code: codeSchema,
  description: descriptionSchema,
  order: z.number().int().min(0).default(0),
});

export const updateSubjectSchema = z.object({
  name: nameSchema.optional(),
  code: codeSchema.optional(),
  description: descriptionSchema,
  order: z.number().int().min(0).optional(),
});

// Topic schemas
export const createTopicSchema = z.object({
  subjectId: z.string().cuid(),
  name: nameSchema,
  code: codeSchema,
  description: descriptionSchema,
  order: z.number().int().min(0).default(0),
});

export const updateTopicSchema = z.object({
  name: nameSchema.optional(),
  code: codeSchema.optional(),
  description: descriptionSchema,
  order: z.number().int().min(0).optional(),
});

// Progress schemas
export const updateProgressSchema = z.object({
  topicId: z.string().cuid(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED']),
  notes: notesSchema,
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// Institution schemas
export const createInstitutionSchema = z.object({
  name: nameSchema,
  code: codeSchema,
  description: descriptionSchema,
});

export const updateInstitutionSchema = z.object({
  name: nameSchema.optional(),
  code: codeSchema.optional(),
  description: descriptionSchema,
});

// Exam Assignment schema
export const createExamAssignmentSchema = z.object({
  examId: z.string().cuid(),
  institutionId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
}).refine((data) => {
  return !!(data.institutionId || data.userId);
}, {
  message: 'Either institutionId or userId must be provided',
});
