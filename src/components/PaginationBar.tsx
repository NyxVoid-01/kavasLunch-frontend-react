import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PaginationBarProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

// Paginación común de las listas. Al cambiar de página vuelve al inicio de la pantalla.
export default function PaginationBar({ page, totalPages, onChange }: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const go = (next: number) => {
    onChange(next);
    window.scrollTo({ top: 0 });
  };

  return (
    <Card className="border-2">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <Button variant="outline" className="border-2" onClick={() => go(page - 1)} disabled={page === 1}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="flex items-center gap-2" aria-live="polite">
          <span className="text-sm text-muted-foreground">Página</span>
          <span className="text-lg font-bold text-primary">{page}</span>
          <span className="text-sm text-muted-foreground">de {totalPages}</span>
        </div>

        <Button variant="outline" className="border-2" onClick={() => go(page + 1)} disabled={page === totalPages}>
          Siguiente
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
}
