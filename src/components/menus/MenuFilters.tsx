import { useId } from 'react';
import { Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export interface FilterOption<T extends string> {
  value: T;
  label: string;
}

const CHIP_CLASS =
  'h-9 rounded-full border-2 border-border bg-background px-3.5 text-sm font-medium hover:border-primary/50 hover:bg-primary/5 hover:text-foreground data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary';

// Grupo de opciones excluyentes siempre visibles (control segmentado): una sola pulsación, sin abrir un desplegable
function FilterGroup<T extends string>({
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
      <ToggleGroup
        type="single"
        value={value}
        // Radix permite deseleccionar; aquí siempre debe haber una opción elegida
        onValueChange={(next) => next && onChange(next as T)}
        aria-labelledby={labelId}
        className="flex flex-wrap justify-start gap-2"
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value} className={CHIP_CLASS}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
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
