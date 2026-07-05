/** @jest-environment node */

import { authFailure, authSuccess, authMessage } from '@/lib/auth/responses';
import { ConflictError } from '@/lib/errors/AppError';

describe('auth responses', () => {
  it('returns success envelope', async () => {
    const res = authSuccess({ id: '1' });
    const body = await res.json();
    expect(body).toEqual({ success: true, data: { id: '1' } });
    expect(res.status).toBe(200);
  });

  it('returns message envelope', async () => {
    const res = authMessage('Done');
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.message).toBe('Done');
  });

  it('returns failure envelope from AppError', async () => {
    const res = authFailure('Email exists', 409);
    const body = await res.json();
    expect(body).toEqual({ success: false, message: 'Email exists', errors: [] });
    expect(res.status).toBe(409);
  });

  it('maps AppError in authFailureFromError', async () => {
    const { authFailureFromError } = await import('@/lib/auth/responses');
    const res = authFailureFromError(new ConflictError('Duplicate'));
    const body = await res.json();
    expect(body.message).toBe('Duplicate');
    expect(body.success).toBe(false);
  });
});
