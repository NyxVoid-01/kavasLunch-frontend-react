import { CalendarX } from 'lucide-react';
import { CARD_GRID_COLUMNS } from '@/lib/layout';
import { cn } from '@/lib/utils';
import { MenuCardSkeleton } from '@/components/menus/MenuCard';
import ResultsSummary from '@/components/ResultsSummary';
import { EmptyState, ErrorState } from '@/components/StateMessages';


// Cuadrícula de carga: repite el esqueleto de MenuCard
export function MenuGridSkeleton({ count = 3, className = CARD_GRID_COLUMNS }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-5', className)} aria-busy="true" aria-label="Cargando menús">
      {Array.from({ length: count }).map((_, i) => (
        <MenuCardSkeleton key={i} />
      ))}
    </div>
  );
}

export const MenusSummary = ({ count }: { count: number }) => <ResultsSummary count={count} singular="menú" plural="menús" />;

export const MenusError = ({ onRetry }: { onRetry: () => void }) => (
  <ErrorState title="No se pudieron cargar los menús" onRetry={onRetry} />
);

export const MenusEmpty = ({ onReset }: { onReset?: () => void }) => (
  <EmptyState
    icon={CalendarX}
    title="No hay menús disponibles para los filtros seleccionados"
    description="Intenta cambiar los filtros o vuelve más tarde"
    action={onReset ? { label: 'Ver todos los menús', onClick: onReset } : undefined}
  />
);
