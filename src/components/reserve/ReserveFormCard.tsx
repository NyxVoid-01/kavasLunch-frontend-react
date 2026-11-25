import type { ReactNode } from 'react';
import { Check, Clock, CreditCard, type LucideIcon } from 'lucide-react';
import type { PaymentMethod, TimeSlot } from '@/types';
import PaymentMethodPicker, { PaymentMethodPickerSkeleton } from '@/components/reserve/PaymentMethodPicker';
import SlotPicker, { SlotPickerSkeleton } from '@/components/reserve/SlotPicker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Medidas compartidas entre la tarjeta y su esqueleto: si cambian aquí, cambian en ambos
const CARD_CLASS = 'border-2 border-accent/30 shadow-xl overflow-hidden';
const HEADER_CLASS = 'px-4 py-3 space-y-0.5 border-b-2 border-accent/20 bg-gradient-to-br from-accent/10 to-primary/5';
const BODY_CLASS = 'p-4 space-y-4';
const SUBMIT_HEIGHT = 'h-11';

const FormSection = ({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) => (
  <fieldset className="space-y-2 min-w-0">
    <legend className="flex items-center gap-2 mb-2 font-semibold">
      <Icon className="w-4 h-4" />
      {title}
    </legend>
    {children}
  </fieldset>
);

interface ReserveFormCardProps {
  slots?: TimeSlot[];
  slotsLoading: boolean;
  slot: string;
  onSlotChange: (value: string) => void;
  methods?: PaymentMethod[];
  methodsLoading: boolean;
  method: string;
  onMethodChange: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  // No se puede reservar (fecha fuera de regla, agotado o ya hay una reserva ese día)
  blocked: boolean;
}

// Formulario "Confirmar Reserva": turno de recojo, método de pago y confirmación
export default function ReserveFormCard({
  slots,
  slotsLoading,
  slot,
  onSlotChange,
  methods,
  methodsLoading,
  method,
  onMethodChange,
  onSubmit,
  submitting,
  blocked,
}: ReserveFormCardProps) {
  const noSlotsLeft = !!slots && !slots.some((s) => s.available);

  return (
    <Card className={CARD_CLASS}>
      <div className={HEADER_CLASS}>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Check className="w-5 h-5" />
          Confirmar Reserva
        </h2>
        <p className="text-sm text-muted-foreground">Completa los detalles</p>
      </div>

      <form
        className={BODY_CLASS}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        noValidate
      >
        <FormSection icon={Clock} title="Horario de Recojo">
          {slotsLoading || !slots ? (
            <SlotPickerSkeleton />
          ) : (
            <SlotPicker slots={slots} value={slot} onChange={onSlotChange} disabled={blocked || submitting} />
          )}
          {noSlotsLeft && !blocked && (
            <p className="text-sm text-destructive" role="alert">
              No hay horarios disponibles para este día.
            </p>
          )}
        </FormSection>

        <FormSection icon={CreditCard} title="Método de Pago">
          {methodsLoading || !methods ? (
            <PaymentMethodPickerSkeleton />
          ) : (
            <PaymentMethodPicker methods={methods} value={method} onChange={onMethodChange} disabled={blocked || submitting} />
          )}
        </FormSection>

        <Button
          type="submit"
          className={`w-full ${SUBMIT_HEIGHT} font-bold shadow-lg bg-gradient-to-r from-primary to-[#AE4747] hover:from-[#8A1616] hover:to-[#9E4040]${submitting ? " animate-pulse" : ""}`}
          aria-busy={submitting}
          disabled={blocked || submitting || !slot || !method}
        >
          {submitting ? (
            <>
              Procesando...
            </>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Confirmar Reserva
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

// Esqueleto de ReserveFormCard: misma estructura y medidas que la tarjeta, reutilizando los de sus partes
export function ReserveFormCardSkeleton() {
  return (
    <Card className={CARD_CLASS} aria-busy="true" aria-label="Cargando formulario">
      <div className={HEADER_CLASS}>
        <Skeleton className="h-7 w-44 bg-background/60" />
        <Skeleton className="h-5 w-32 bg-background/60" />
      </div>

      <div className={BODY_CLASS}>
        <div className="space-y-2">
          <Skeleton className="h-6 w-40 mb-2" />
          <SlotPickerSkeleton />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-36 mb-2" />
          <PaymentMethodPickerSkeleton />
        </div>
        <Skeleton className={`w-full ${SUBMIT_HEIGHT}`} />
      </div>
    </Card>
  );
}
