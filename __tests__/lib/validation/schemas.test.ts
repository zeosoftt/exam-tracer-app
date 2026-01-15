/**
 * Validation Schema Tests
 */

import { loginSchema, registerSchema, createExamSchema } from '@/lib/validation/schemas';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };
      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      };
      expect(() => registerSchema.parse(validData)).not.toThrow();
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
        firstName: 'John',
        lastName: 'Doe',
      };
      expect(() => registerSchema.parse(invalidData)).toThrow();
    });
  });

  describe('createExamSchema', () => {
    it('should validate correct exam data', () => {
      const validData = {
        name: 'Test Exam',
        code: 'TEST_EXAM',
        description: 'Test description',
      };
      expect(() => createExamSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid code format', () => {
      const invalidData = {
        name: 'Test Exam',
        code: 'test exam', // Contains space and lowercase
        description: 'Test description',
      };
      expect(() => createExamSchema.parse(invalidData)).toThrow();
    });
  });
});
