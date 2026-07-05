/**
 * Prisma bilinen hata kodlarını AppError'a çevirir.
 */

import { ConflictError, NotFoundError } from '@/lib/errors/AppError';

type PrismaErrorLike = { code?: string };

export function assertPrismaOrThrow(error: unknown, messages?: Partial<Record<'P2002' | 'P2025' | 'P2003', string>>): never {
  const code = (error as PrismaErrorLike)?.code;
  if (code === 'P2025') {
    throw new NotFoundError(messages?.P2025 ?? 'Kayıt bulunamadı.');
  }
  if (code === 'P2002') {
    throw new ConflictError(messages?.P2002 ?? 'Bu kod zaten kullanılıyor.');
  }
  if (code === 'P2003') {
    throw new NotFoundError(messages?.P2003 ?? 'İlişkili kayıt bulunamadı.');
  }
  throw error;
}
