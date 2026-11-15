import { useId } from 'react';
import { Filter } from 'lucide-react';
import ChipGroup, { type ChipOption } from '@/components/ChipGroup';
import { Card } from '@/components/ui/card';

export type FilterOption<T extends string> = ChipOption<T>;

// Grupo de filtro con su título: opciones excluyentes siempre visibles
export function FilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: FilterOption<T>[];
  onChange: (value: T) => void;
}) {
  const labelId = useId();

  return (
    <div>
      <p id={labelId} className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <ChipGroup value={value} options={options} onChange={onChange} ariaLabelledBy={labelId} />
    </div>
  );
}

interface MenuFiltersProps<D extends string, S extends string> {
  date: D;
  dateOptions: FilterOption<D>[];
  onDateChange: (value: D) => void;
  stock: S;
  stockOptions: FilterOption<S>[];
  onStockChange: (value: S) => void;
}

// Panel de filtros de las pantallas de menús (pública y de usuario)
export default function MenuFilters<D extends string, S extends string>({
  date,
  dateOptions,
  onDateChange,
  stock,
  stockOptions,
  onStockChange,
}: MenuFiltersProps<D, S>) {
  return (
    <Card className="border-2 border-primary/20 p-4 space-y-4">
      <h2 className="flex items-center gap-2 font-semibold">
        <Filter className="w-5 h-5 text-primary" />
        Filtros
      </h2>
      <FilterGroup label="Fecha" value={date} options={dateOptions} onChange={onDateChange} />
      <FilterGroup label="Disponibilidad" value={stock} options={stockOptions} onChange={onStockChange} />
    </Card>
  );
}
