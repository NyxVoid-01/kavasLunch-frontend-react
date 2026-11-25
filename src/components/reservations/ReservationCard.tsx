import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, Clock, Eye, Hourglass, Mail, UtensilsCrossed, X, XCircle, type LucideIcon } from 'lucide-react';
import type { ReservationStatus, UserReservation } from '@/types';
import { parseLocalDate } from '@/lib/dates';
import { CARD_GRID_COLUMNS } from '@/lib/layout';
import { PAYMENT_LABELS, slotLabel } from '@/lib/labels';
import { canCancelReservation } from '@/lib/reservationRules';
import { cn } from '@/lib/utils';
import ReservationStatusBadge from '@/components/ReservationStatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Medidas compartidas entre la tarjeta y su esqueleto: si cambian aquí, cambian en ambos
const CARD_CLASS = 'overflow-hidden border-2 border-primary/20 flex flex-col';
const HEADER_CLASS = 'px-4 py-3 border-b-2 border-accent/30 bg-primary/10';
const BODY_CLASS = 'p-4 space-y-3 flex flex-col flex-grow';
const CODE_BOX_CLASS = 'rounded-xl px-3 py-2 text-center';
const ACTION_HEIGHT = 'h-11';


const STATUS_ICONS: Record<ReservationStatus, LucideIcon> = {
  pending: Clock,
  delivered: CheckCircle,
  cancelled: XCircle,
  expired: Hourglass,
};


interface ReservationCardProps {
  reservation: UserReservation;
  onDetail: (reservation: UserReservation) => void;
  onCancel: (reservation: UserReservation) => void;
}

// Tarjeta de una reserva: fecha y turno, código de recojo, plato, pago y acciones
export default function ReservationCard({ reservation, onDetail, onCancel }: ReservationCardProps) {
  const StatusIcon = STATUS_ICONS[reservation.status] ?? Clock;
  const pending = reservation.status === 'pending';
  const cancellable = canCancelReservation(reservation);

  return (
    <Card className={cn(CARD_CLASS, 'transition-all hover:-translate-y-1 hover:shadow-xl')}>
      <div className={HEADER_CLASS}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <StatusIcon className="w-5 h-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="font-semibold truncate">
                {format(parseLocalDate(reservation.reservation_date), "d 'de' MMMM", { locale: es })}
              </p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {slotLabel(reservation)}
              </p>
            </div>
          </div>
          <ReservationStatusBadge status={reservation.status} />
        </div>
      </div>

      <div className={BODY_CLASS}>
        {pending && (
          <p className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            Correo de confirmación enviado
          </p>
        )}

        <div className={cn(CODE_BOX_CLASS, 'bg-primary text-primary-foreground')}>
          <p className="text-[11px] leading-4 font-medium">Código de Recojo</p>
          <p className="text-2xl font-bold tracking-wider">{reservation.code}</p>
        </div>

        {reservation.menu.main_dish && (
          <p className="flex items-center gap-2 text-sm font-semibold">
            <UtensilsCrossed className="w-4 h-4 shrink-0 text-primary" />
            <span className="truncate">{reservation.menu.main_dish}</span>
          </p>
        )}

        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Método de Pago</p>
            <p className="text-sm font-semibold">{PAYMENT_LABELS[reservation.payment_method] ?? reservation.payment_method}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-primary leading-6">S/ {Number(reservation.menu.price).toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <Button variant="outline" className={cn(ACTION_HEIGHT, 'flex-1 font-semibold')} onClick={() => onDetail(reservation)}>
            <Eye className="w-4 h-4 mr-2" />
            Ver detalle
          </Button>
          {pending && (
            <Button
              variant="destructive"
              size="icon"
              className={cn(ACTION_HEIGHT, 'w-11 shrink-0')}
              disabled={!cancellable}
              onClick={() => onCancel(reservation)}
              aria-label={cancellable ? 'Cancelar reserva' : 'No se puede cancelar: solo hasta las 10:00 del día de la reserva'}
              title={cancellable ? 'Cancelar reserva' : 'Solo se puede cancelar hasta las 10:00 del día de la reserva'}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// Esqueleto de ReservationCard: misma estructura y medidas que la tarjeta
export function ReservationCardSkeleton() {
  return (
    <Card className={CARD_CLASS} aria-hidden="true">
      <div className={HEADER_CLASS}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full bg-background/60" />
            <div className="space-y-1">
              <Skeleton className="h-6 w-28 bg-background/60" />
              <Skeleton className="h-4 w-24 bg-background/60" />
            </div>
          </div>
          <Skeleton className="h-[22px] w-20 rounded-full bg-background/60" />
        </div>
      </div>

      <div className={BODY_CLASS}>
        <Skeleton className={cn(CODE_BOX_CLASS, 'h-16 w-full')} />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-end justify-between gap-2">
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-10 ml-auto" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <div className="mt-auto flex gap-2">
          <Skeleton className={cn(ACTION_HEIGHT, 'flex-1')} />
          <Skeleton className={cn(ACTION_HEIGHT, 'w-11')} />
        </div>
      </div>
    </Card>
  );
}

// Cuadrícula de carga: repite el esqueleto de ReservationCard
export function ReservationGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={cn('grid gap-5', CARD_GRID_COLUMNS)} aria-busy="true" aria-label="Cargando reservas">
      {Array.from({ length: count }).map((_, i) => (
        <ReservationCardSkeleton key={i} />
      ))}
    </div>
  );
}
