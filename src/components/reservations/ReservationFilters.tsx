import { Filter, Search, X } from 'lucide-react';
import type { ReservationStatus } from '@/types';
import { FilterGroup, type FilterOption } from '@/components/menus/MenuFilters';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export type StatusFilter = 'all' | ReservationStatus;

const STATUS_OPTIONS: FilterOption<StatusFilter>[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'delivered', label: 'Entregadas' },
  { value: 'cancelled', label: 'Canceladas' },
  { value: 'expired', label: 'Vencidas' },
];

interface ReservationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  // 'YYYY-MM-DD' o vacío
  date: string;
  onDateChange: (value: string) => void;
  onClear: () => void;
}

// Panel de filtros de Mis Reservas: búsqueda, estado y fecha (RF-007)
export default function ReservationFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  date,
  onDateChange,
  onClear,
}: ReservationFiltersProps) {
  const hasFilters = search !== '' || status !== 'all' || date !== '';

  return (
    <Card className="border-2 border-primary/20 p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold">
          <Filter className="w-5 h-5 text-primary" />
          Filtros
        </h2>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-8 px-2 text-primary" onClick={onClear}>
            <X className="w-4 h-4 mr-1" />
            Quitar filtros
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por código, plato o fecha..."
          aria-label="Buscar reservas"
          className="pl-9"
        />
      </div>

      <FilterGroup label="Estado" value={status} options={STATUS_OPTIONS} onChange={onStatusChange} />

      <div>
        <label htmlFor="reservation-date" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Fecha de reserva
        </label>
        <Input id="reservation-date" type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
      </div>
    </Card>
  );
}
