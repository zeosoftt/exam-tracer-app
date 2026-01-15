/**
 * Validation Helper Functions
 * Wrapper for Zod validation with proper error handling
 */

import { z } from 'zod';
import { ValidationError } from '@/lib/errors/AppError';

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error; // Let errorHandler handle Zod errors
    }
    throw new ValidationError('Validation failed');
  }
}

export function validateAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
  return schema.parseAsync(data);
}
