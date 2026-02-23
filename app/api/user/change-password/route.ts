/**
 * Change Password API
 * POST: change current user password (currentPassword, newPassword)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { comparePassword, hashPassword } from '@/lib/auth/password';
import { validate } from '@/lib/validation/validate';
import { changePasswordSchema } from '@/lib/validation/schemas';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { UnauthorizedError } from '@/lib/errors/AppError';
import { HTTP_STATUS } from '@/config/constants';

async function changePasswordHandler(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  const userId = session.user.id;

  const body = await req.json();
  const { currentPassword, newPassword } = validate(changePasswordSchema, body);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user) {
    throw new UnauthorizedError();
  }

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { success: false, error: { message: 'Mevcut şifre hatalı' } },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return NextResponse.json({ success: true, message: 'Şifre güncellendi' });
}

export const POST = asyncHandler(changePasswordHandler);
