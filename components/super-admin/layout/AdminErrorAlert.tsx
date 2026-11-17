import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  message: string;
  title?: string;
  onRetry?: () => void;
  retrying?: boolean;
  onDismiss?: () => void;
  className?: string;
};

/** Tek tip hata uyarısı: ikon + mesaj + opsiyonel "Tekrar dene" / "Kapat". */
export function AdminErrorAlert({ message, title, onRetry, retrying, onDismiss, className }: Props) {
  return (
    <Alert variant="destructive" className={cn('flex items-start gap-3', className)}>
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? <AlertTitle>{title}</AlertTitle> : null}
        <AlertDescription>{message}</AlertDescription>
      </div>
      {onRetry || onDismiss ? (
        <div className="flex shrink-0 items-center gap-1">
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={retrying}
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', retrying && 'animate-spin')} aria-hidden />
              Tekrar dene
            </Button>
          ) : null}
          {onDismiss ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              Kapat
            </Button>
          ) : null}
        </div>
      ) : null}
    </Alert>
  );
}
