import { Check, Clock } from 'lucide-react';
import type { TimeSlot } from '@/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Medidas compartidas entre los turnos y su esqueleto
const GRID_CLASS = 'grid grid-cols-2 sm:grid-cols-4 gap-2';
const SLOT_HEIGHT = 'h-14';

// Pocas plazas: se avisa para que el usuario decida a tiempo
const LOW_CAPACITY = 5;

interface SlotPickerProps {
  slots: TimeSlot[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Turnos de recojo (11, 12, 13 y 14 h): el usuario elige uno; los llenos o terminados salen deshabilitados
export default function SlotPicker({ slots, value, onChange, disabled = false }: SlotPickerProps) {
  return (
    <div role="radiogroup" aria-label="Horario de recojo" className={GRID_CLASS}>
      {slots.map((slot) => {
        const selected = slot.available && value === slot.value;
        const unavailable = !slot.available || disabled;
        const fewLeft = slot.available && slot.capacity_available !== undefined && slot.capacity_available <= LOW_CAPACITY;

        return (
          <button
            key={slot.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={unavailable}
            onClick={() => onChange(slot.value)}
            className={cn(
              'relative flex flex-col items-center justify-center gap-0.5 rounded-2xl border-2 font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              SLOT_HEIGHT,
              selected
                ? 'border-primary bg-primary text-primary-foreground shadow-md scale-105'
                : unavailable
                  ? 'border-muted bg-muted/30 text-muted-foreground opacity-50 cursor-not-allowed'
                  : 'border-border bg-card hover:border-primary hover:bg-accent/10 hover:scale-105'
            )}
          >
            <Clock className="w-4 h-4" />
            <span>{slot.label}</span>
            {fewLeft && !selected && (
              <span className="text-[10px] leading-none font-medium text-[#92400E]">
                Quedan {slot.capacity_available}
              </span>
            )}
            {selected && (
              <span className="absolute -top-1 -right-1 flex rounded-full bg-success p-0.5 text-success-foreground">
                <Check className="w-3 h-3" />
              </span>
            )}
            {!slot.available && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="rounded bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
                  No disp.
                </span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Esqueleto de SlotPicker: misma cuadrícula y altura que los turnos
export function SlotPickerSkeleton() {
  return (
    <div className={GRID_CLASS} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className={cn(SLOT_HEIGHT, 'rounded-2xl')} />
      ))}
    </div>
  );
}
