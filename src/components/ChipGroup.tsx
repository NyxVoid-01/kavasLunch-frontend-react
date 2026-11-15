import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

const CHIP_CLASS =
  'h-9 rounded-full border-2 border-border bg-background px-3.5 text-sm font-medium hover:border-primary/50 hover:bg-primary/5 hover:text-foreground data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary';

interface ChipGroupProps<T extends string> {
  value: T;
  options: ChipOption<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

// Opciones excluyentes siempre visibles (control segmentado): una sola pulsación, sin abrir un desplegable
export default function ChipGroup<T extends string>({ value, options, onChange, ariaLabel, ariaLabelledBy }: ChipGroupProps<T>) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      // Radix permite deseleccionar; aquí siempre debe haber una opción elegida
      onValueChange={(next) => next && onChange(next as T)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className="flex flex-wrap justify-start gap-2"
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value} className={CHIP_CLASS}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
