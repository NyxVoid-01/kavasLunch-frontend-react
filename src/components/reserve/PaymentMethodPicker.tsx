import { Banknote, CreditCard, Smartphone, type LucideIcon } from 'lucide-react';
import type { PaymentMethod } from '@/types';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';

// Medidas compartidas entre las opciones y su esqueleto
const OPTION_CLASS = 'flex items-center gap-3 rounded-xl border-2 px-3 py-2';
const OPTION_COUNT = 3;

const ICONS: Record<string, LucideIcon> = {
  yape: Smartphone,
  credit_card: CreditCard,
  cash: Banknote,
};

// Título del recuadro de instrucciones de cada método
const INSTRUCTION_TITLES: Record<string, string> = {
  yape: 'Número de Yape / Plin:',
  credit_card: 'Pago con tarjeta',
  cash: 'Pago en caja del comedor',
};

interface PaymentMethodPickerProps {
  methods: PaymentMethod[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Métodos de pago como tarjetas elegibles, con las instrucciones del método elegido debajo
export default function PaymentMethodPicker({ methods, value, onChange, disabled = false }: PaymentMethodPickerProps) {
  const selected = methods.find((method) => method.id === value);

  return (
    <div className="space-y-3">
      <RadioGroup value={value} onValueChange={onChange} disabled={disabled} aria-label="Método de pago" className="gap-2">
        {methods.map((method) => {
          const Icon = ICONS[method.id] ?? CreditCard;
          const isSelected = method.id === value;
          const isDisabled = disabled || !method.enabled;

          return (
            <Label
              key={method.id}
              htmlFor={`pay-${method.id}`}
              className={cn(
                OPTION_CLASS,
                'transition-colors',
                isDisabled ? 'cursor-not-allowed opacity-60 border-muted bg-muted/50' : 'cursor-pointer hover:border-primary hover:bg-accent/5',
                isSelected ? 'border-primary bg-accent/5' : 'border-border bg-card'
              )}
            >
              <RadioGroupItem value={method.id} id={`pay-${method.id}`} disabled={isDisabled} />
              <span className="flex bg-primary/10 p-1.5 rounded-lg text-primary">
                <Icon className="w-4 h-4" />
              </span>
              <span>
                <span className="block text-sm font-bold">{method.name}</span>
                <span className="block text-xs font-normal text-muted-foreground">{method.description}</span>
              </span>
            </Label>
          );
        })}
      </RadioGroup>

      {selected && (
        <div
          className={cn(
            'space-y-0.5 rounded-xl px-3 py-2',
            selected.id === 'cash' ? 'border border-accent/30 bg-accent/5' : 'border-2 border-primary/20 bg-primary/5'
          )}
          aria-live="polite"
        >
          <p className={cn('text-sm font-bold', selected.id === 'cash' && 'text-primary')}>
            {INSTRUCTION_TITLES[selected.id] ?? selected.name}
          </p>
          {selected.phone && <p className="text-xl font-bold text-primary">{selected.phone}</p>}
          {selected.instructions && <p className="text-xs text-muted-foreground">{selected.instructions}</p>}
        </div>
      )}
    </div>
  );
}

// Esqueleto de PaymentMethodPicker: mismas opciones y medidas
export function PaymentMethodPickerSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="grid gap-2">
        {Array.from({ length: OPTION_COUNT }).map((_, i) => (
          <div key={i} className={cn(OPTION_CLASS, 'border-border')}>
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
