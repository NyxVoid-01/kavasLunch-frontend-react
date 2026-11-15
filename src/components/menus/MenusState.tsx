import { CalendarX, RefreshCw, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MenuCardSkeleton } from '@/components/menus/MenuCard';
import { Button } from '@/components/ui/button';

// Cuadrícula de menús: tantas columnas como quepan, con tarjetas de al menos 290 px
export const MENU_GRID_COLUMNS = 'grid-cols-[repeat(auto-fill,minmax(290px,1fr))]';

// Cuadrícula de carga: repite el esqueleto de MenuCard
export function MenuGridSkeleton({ count = 3, className = MENU_GRID_COLUMNS }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-5', className)} aria-busy="true" aria-label="Cargando menús">
      {Array.from({ length: count }).map((_, i) => (
        <MenuCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Resultado de los filtros, anunciado a lectores de pantalla cuando cambia
export function MenusSummary({ count }: { count: number }) {
  return (
    <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
      Mostrando <strong className="text-foreground">{count}</strong> {count === 1 ? 'menú' : 'menús'}
    </p>
  );
}

export function MenusError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="py-16 px-6 text-center border-2 border-dashed rounded-2xl" role="alert">
      <WifiOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <p className="text-lg font-semibold">No se pudieron cargar los menús</p>
      <p className="text-sm text-muted-foreground mt-2">No hay conexión con el servidor. Inténtalo nuevamente.</p>
      <Button variant="outline" className="mt-6" onClick={onRetry}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Reintentar
      </Button>
    </div>
  );
}

// Sin resultados: se ofrece una salida (quitar filtros) en lugar de dejar al usuario en un callejón sin salida
export function MenusEmpty({ onReset }: { onReset?: () => void }) {
  return (
    <div className="py-16 px-6 text-center border-2 border-dashed rounded-2xl">
      <CalendarX className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <p className="text-lg text-muted-foreground">No hay menús disponibles para los filtros seleccionados</p>
      <p className="text-sm text-muted-foreground mt-2">Intenta cambiar los filtros o vuelve más tarde</p>
      {onReset && (
        <Button variant="outline" className="mt-6" onClick={onReset}>
          Ver todos los menús
        </Button>
      )}
    </div>
  );
}
