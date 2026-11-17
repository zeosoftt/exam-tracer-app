import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  page: number;
  totalPages: number;
  total: number;
  /** Tekil/çoğul isim: "kullanıcı", "kayıt" */
  noun: string;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

/**
 * Tablo altı sayfalama. Tek sayfa olsa bile toplam sayıyı gösterir;
 * ok butonları yalnızca birden fazla sayfa varken çizilir.
 */
export function AdminPagination({ page, totalPages, total, noun, onPageChange, disabled }: Props) {
  if (total === 0) return null;

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3"
      aria-label="Sayfalama"
    >
      <p className="text-sm text-muted-foreground tabular-nums">
        Toplam {total} {noun}
        {totalPages > 1 ? (
          <>
            <span aria-hidden> · </span>
            Sayfa {page} / {totalPages}
          </>
        ) : null}
      </p>
      {totalPages > 1 ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Önceki sayfa"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={disabled || page <= 1}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Sonraki sayfa"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={disabled || page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ) : null}
    </nav>
  );
}
