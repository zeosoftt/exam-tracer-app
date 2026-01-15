/**
 * Password Utility Tests
 */

import { hashPassword, comparePassword } from '@/lib/auth/password';

describe('Password Utilities', () => {
  const testPassword = 'TestPassword123!';

  it('should hash a password', async () => {
    const hash = await hashPassword(testPassword);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(testPassword);
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should compare password correctly', async () => {
    const hash = await hashPassword(testPassword);
    const isValid = await comparePassword(testPassword, hash);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const hash = await hashPassword(testPassword);
    const isValid = await comparePassword('WrongPassword', hash);
    expect(isValid).toBe(false);
  });

  it('should produce different hashes for same password', async () => {
    const hash1 = await hashPassword(testPassword);
    const hash2 = await hashPassword(testPassword);
    expect(hash1).not.toBe(hash2); // Different salts should produce different hashes
  });
});
