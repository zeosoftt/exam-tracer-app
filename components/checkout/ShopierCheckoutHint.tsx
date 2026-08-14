import { Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type Props = {
  className?: string;
  /** Kayıtlı e-posta göster (ayarlar / oturum açıkken) */
  userEmail?: string | null;
  compact?: boolean;
};

export function ShopierCheckoutHint({ className, userEmail, compact = false }: Props) {
  const emailHint = userEmail?.trim()
    ? `Shopier ödeme sayfasında hesabınızdaki e-postayı kullanın: ${userEmail.trim()}`
    : 'Shopier ödeme sayfasında The Goal Lab hesabınızla kayıt olduğunuz e-postayı kullanın. Farklı e-posta ile ödeme yaparsanız Pro plan otomatik açılmaz.';

  return (
    <p
      className={cn(
        'flex gap-2 rounded-xl border border-amber-200/80 bg-amber-50/90 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100',
        compact ? 'px-3 py-2 text-xs leading-relaxed' : 'px-4 py-3 text-sm leading-relaxed',
        className,
      )}
    >
      <Info className={cn('shrink-0 text-amber-600 dark:text-amber-400', compact ? 'mt-0.5 h-3.5 w-3.5' : 'mt-0.5 h-4 w-4')} aria-hidden />
      <span>{emailHint}</span>
    </p>
  );
}
