/**
 * Oturum tokenVersion artırma — şifre değişimi / hesap silme sonrası tüm JWT'leri geçersiz kılar.
 */

import { prisma } from '@/lib/db/prisma';
import { ensureUserSecurityColumnsOnce } from '@/lib/db/ensureUserSecurityColumns';

export async function incrementUserTokenVersion(userId: string): Promise<void> {
  await ensureUserSecurityColumnsOnce(prisma);
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  } catch {
    // Kolon yoksa sessiz geç (legacy DB)
  }
}
