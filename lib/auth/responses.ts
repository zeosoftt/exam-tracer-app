/**
 * Standart auth API yanıt zarfı — tüm /api/auth/* endpoint'leri bu formatı kullanır.
 */

import { NextResponse } from 'next/server';
import { HTTP_STATUS } from '@/config/constants';
import { AppError } from '@/lib/errors/AppError';

export type AuthErrorDetail = {
  field?: string;
  message: string;
};

export type AuthSuccessResponse<T> = {
  success: true;
  data: T;
};

export type AuthErrorResponse = {
  success: false;
  message: string;
  errors: AuthErrorDetail[];
};

export function authSuccess<T>(data: T, status: number = HTTP_STATUS.OK): NextResponse<AuthSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function authCreated<T>(data: T): NextResponse<AuthSuccessResponse<T>> {
  return authSuccess(data, HTTP_STATUS.CREATED);
}

export function authMessage(message: string, extra?: Record<string, unknown>): NextResponse<AuthSuccessResponse<Record<string, unknown>>> {
  return authSuccess({ message, ...extra });
}

export function authFailure(
  message: string,
  status: number = HTTP_STATUS.BAD_REQUEST,
  errors: AuthErrorDetail[] = [],
): NextResponse<AuthErrorResponse> {
  return NextResponse.json({ success: false, message, errors }, { status });
}

/** AppError / Zod → standart auth hata yanıtı */
export function authFailureFromError(error: unknown): NextResponse<AuthErrorResponse> {
  if (error instanceof AppError) {
    return authFailure(error.message, error.statusCode);
  }

  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> };
    const errors: AuthErrorDetail[] = zodError.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return authFailure('Validation failed', HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
  }

  return authFailure('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
}
