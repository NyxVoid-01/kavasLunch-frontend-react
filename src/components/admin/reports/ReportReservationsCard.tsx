import { format } from 'date-fns';
import { SearchX } from 'lucide-react';
import type { AdminReservation } from '@/services/admin';
import { parseLocalDate } from '@/lib/dates';
import { PAYMENT_LABELS, slotLabel } from '@/lib/labels';
import ReservationStatusBadge from '@/components/ReservationStatusBadge';
import { EmptyState } from '@/components/StateMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Medidas compartidas entre la lista y su esqueleto
const ROW_CLASS = 'flex items-center justify-between gap-3 border-b py-3 last:border-0';
const SKELETON_ROWS = 5;

interface ReportReservationsCardProps {
  reservations: AdminReservation[];
  total: number;
}

// Reservas del período (una página de la lista)
export default function ReportReservationsCard({ reservations, total }: ReportReservationsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-lg">Reservas del período ({total})</CardTitle>
      </CardHeader>
      <CardContent>
        {reservations.length === 0 ? (
          <EmptyState compact icon={SearchX} title="No hay reservas en este período" description="Prueba con otras fechas." />
        ) : (
          <ul>
            {reservations.map((r) => (
              <li key={r.id} className={ROW_CLASS}>
                <div className="min-w-0">
                  <p className="font-medium truncate">{r.user.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {r.code} · {format(parseLocalDate(r.reservation_date), 'dd/MM/yyyy')} · {slotLabel(r)} · {PAYMENT_LABELS[r.payment_method]}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <ReservationStatusBadge status={r.status} />
                  <p className="text-xs font-semibold text-primary">S/ {Number(r.menu.price).toFixed(2)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// Esqueleto de ReportReservationsCard: mismo contenedor y filas
export function ReportReservationsCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardHeader className="pb-1">
        <Skeleton className="h-7 w-56" />
      </CardHeader>
      <CardContent>
        {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
          <div key={i} className={ROW_CLASS}>
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64 max-w-full" />
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
