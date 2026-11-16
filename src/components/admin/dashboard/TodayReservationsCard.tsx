import { Clock, Package } from 'lucide-react';
import type { AdminReservation } from '@/services/admin';
import { slotLabel } from '@/lib/labels';
import { cn } from '@/lib/utils';
import ReservationStatusBadge from '@/components/ReservationStatusBadge';
import { EmptyState } from '@/components/StateMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Medidas compartidas entre la lista y su esqueleto
const ROW_CLASS = 'flex items-center justify-between gap-3 border-b py-3 last:border-0';
const SKELETON_ROWS = 4;

// Reservas del día en el panel (lectura rápida; la gestión está en Despacho)
export default function TodayReservationsCard({ reservations }: { reservations: AdminReservation[] }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-lg">Reservas de Hoy</CardTitle>
      </CardHeader>
      <CardContent>
        {reservations.length === 0 ? (
          <EmptyState compact icon={Package} title="Aún no hay reservas para hoy" description="Cuando los usuarios reserven, aparecerán aquí." />
        ) : (
          <ul>
            {reservations.map((reservation) => {
              const inactive = reservation.status === 'cancelled' || reservation.status === 'expired';
              return (
                <li key={reservation.id} className={cn(ROW_CLASS, inactive && 'opacity-60')}>
                  <div className="min-w-0">
                    <p className={cn('font-medium truncate', reservation.status === 'cancelled' && 'line-through')}>
                      {reservation.user.full_name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {slotLabel(reservation)} · {reservation.code}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <ReservationStatusBadge status={reservation.status} />
                    <p className="text-xs text-muted-foreground">S/ {Number(reservation.menu.price).toFixed(2)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// Esqueleto de TodayReservationsCard: mismo contenedor y filas
export function TodayReservationsCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardHeader className="pb-1">
        <Skeleton className="h-7 w-44" />
      </CardHeader>
      <CardContent>
        {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
          <div key={i} className={ROW_CLASS}>
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Skeleton className="h-[22px] w-20 rounded-full" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
