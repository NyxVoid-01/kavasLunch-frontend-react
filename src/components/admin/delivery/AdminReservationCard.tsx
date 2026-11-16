import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Ban, CheckCircle, Clock, CupSoda, Leaf, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import type { AdminReservation } from '@/services/admin';
import { PAYMENT_LABELS, PAYMENT_STATUS_LABELS, slotLabel } from '@/lib/labels';
import { cn } from '@/lib/utils';
import ReservationStatusBadge from '@/components/ReservationStatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Medidas compartidas entre la tarjeta y su esqueleto: si cambian aquí, cambian en ambos
const CARD_CLASS = 'overflow-hidden border-2 border-primary/20 flex flex-col';
const HEADER_CLASS = 'px-4 py-3 border-b border-border';
const BODY_CLASS = 'p-4 space-y-3 flex flex-col flex-grow';
const CODE_BOX_CLASS = 'rounded-xl px-3 py-1.5 text-center';
const ACTION_HEIGHT = 'h-10';

const DISH_ROWS: { key: 'appetizer' | 'main_dish' | 'drink'; icon: LucideIcon }[] = [
  { key: 'appetizer', icon: Leaf },
  { key: 'main_dish', icon: UtensilsCrossed },
  { key: 'drink', icon: CupSoda },
];

interface AdminReservationCardProps {
  reservation: AdminReservation;
  busy?: boolean;
  onDeliver: (reservation: AdminReservation) => void;
  onCancel: (reservation: AdminReservation) => void;
}

// Texto que reemplaza a los botones cuando la reserva ya no está pendiente (mantiene la altura de la tarjeta)
const closedNote = (reservation: AdminReservation) => {
  switch (reservation.status) {
    case 'delivered':
      return reservation.delivered_at ? `Entregada a las ${format(new Date(reservation.delivered_at), 'HH:mm', { locale: es })}` : 'Entregada';
    case 'cancelled':
      return 'Reserva cancelada';
    case 'expired':
      return 'No se recogió a tiempo';
    default:
      return '';
  }
};

// Tarjeta de una reserva en el despacho: quién, turno, código, platos, pago y acciones
export default function AdminReservationCard({ reservation, busy = false, onDeliver, onCancel }: AdminReservationCardProps) {
  const pending = reservation.status === 'pending';

  return (
    <Card className={cn(CARD_CLASS, !pending && 'bg-muted/30')}>
      <div className={HEADER_CLASS}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold leading-snug truncate">{reservation.user.full_name}</h3>
            <p className="text-xs text-muted-foreground truncate">{reservation.user.email}</p>
          </div>
          <ReservationStatusBadge status={reservation.status} />
        </div>
      </div>

      <div className={BODY_CLASS}>
        <div className={cn(CODE_BOX_CLASS, 'border border-primary/20 bg-primary/10')}>
          <p className="text-[11px] leading-4 text-muted-foreground">Código de Recojo</p>
          <p className="text-xl font-bold tracking-wider text-primary leading-6">{reservation.code}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Turno</p>
            <p className="flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {slotLabel(reservation)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pago</p>
            <p className="font-semibold">
              {PAYMENT_LABELS[reservation.payment_method]}
              <span className="font-normal text-muted-foreground"> · {PAYMENT_STATUS_LABELS[reservation.payment_status]}</span>
            </p>
          </div>
        </div>

        <ul className="space-y-1 rounded-xl bg-muted/50 px-3 py-2 text-sm">
          {DISH_ROWS.map(({ key, icon: Icon }) =>
            reservation.menu[key] ? (
              <li key={key} className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 shrink-0 text-primary" />
                <span className="truncate">{reservation.menu[key]}</span>
              </li>
            ) : null
          )}
          <li className="pt-1 font-bold text-primary">Total: S/ {Number(reservation.menu.price).toFixed(2)}</li>
        </ul>

        <div className="mt-auto">
          {pending ? (
            <div className="grid grid-cols-2 gap-2">
              <Button className={cn(ACTION_HEIGHT, 'font-semibold')} disabled={busy} onClick={() => onDeliver(reservation)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Entregar
              </Button>
              <Button
                variant="outline"
                className={cn(ACTION_HEIGHT, 'font-semibold border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground')}
                disabled={busy}
                onClick={() => onCancel(reservation)}
              >
                <Ban className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          ) : (
            <p className={cn(ACTION_HEIGHT, 'flex items-center justify-center rounded-md bg-muted text-sm text-muted-foreground')}>
              {closedNote(reservation)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// Esqueleto de AdminReservationCard: misma estructura y medidas que la tarjeta
export function AdminReservationCardSkeleton() {
  return (
    <Card className={CARD_CLASS} aria-hidden="true">
      <div className={HEADER_CLASS}>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <Skeleton className="h-[22px] w-40" />
            <Skeleton className="h-4 w-44" />
          </div>
          <Skeleton className="h-[22px] w-20 rounded-full" />
        </div>
      </div>

      <div className={BODY_CLASS}>
        <Skeleton className={cn(CODE_BOX_CLASS, 'h-[52px] w-full')} />
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
        <Skeleton className="h-[102px] w-full rounded-xl" />
        <div className="mt-auto grid grid-cols-2 gap-2">
          <Skeleton className={ACTION_HEIGHT} />
          <Skeleton className={ACTION_HEIGHT} />
        </div>
      </div>
    </Card>
  );
}

export function AdminReservationGridSkeleton({ count = 3, className }: { count?: number; className: string }) {
  return (
    <div className={cn('grid gap-5', className)} aria-busy="true" aria-label="Cargando reservas">
      {Array.from({ length: count }).map((_, i) => (
        <AdminReservationCardSkeleton key={i} />
      ))}
    </div>
  );
}
