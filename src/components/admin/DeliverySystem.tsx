import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, QrCode, RefreshCw, SearchX } from 'lucide-react';
import { toast } from 'sonner';
import { cancelReservationAdmin, deliverReservation, getReservationsOfDay, type AdminReservation } from '@/services/admin';
import { getErrorMessage } from '@/lib/api';
import { todayISO } from '@/lib/dates';
import { CARD_GRID_COLUMNS } from '@/lib/layout';
import { cn } from '@/lib/utils';
import AdminToolbar from '@/components/admin/AdminToolbar';
import AdminReservationCard, { AdminReservationGridSkeleton } from '@/components/admin/delivery/AdminReservationCard';
import DeliverByCodeDialog from '@/components/admin/delivery/DeliverByCodeDialog';
import ChipGroup, { type ChipOption } from '@/components/ChipGroup';
import ConfirmDialog from '@/components/ConfirmDialog';
import PaginationBar from '@/components/PaginationBar';
import ResultsSummary from '@/components/ResultsSummary';
import { EmptyState, ErrorState } from '@/components/StateMessages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ReservationStatus } from '@/types';

const ITEMS_PER_PAGE = 12;
// Las reservas se actualizan solas para que el despacho vea los cambios en tiempo real (RF-012)
const REFRESH_MS = 15_000;

type StatusFilter = 'all' | ReservationStatus;
type SlotFilter = 'all' | '11:00' | '12:00' | '13:00' | '14:00';

const SLOT_OPTIONS: ChipOption<SlotFilter>[] = [
  { value: 'all', label: 'Todas las horas' },
  { value: '11:00', label: '11:00' },
  { value: '12:00', label: '12:00' },
  { value: '13:00', label: '13:00' },
  { value: '14:00', label: '14:00' },
];

// Despacho (RF-012 y RF-013): reservas del día con filtros por estado, hora y usuario, y entrega
export default function DeliverySystem() {
  const queryClient = useQueryClient();
  const today = todayISO();
  const [date, setDate] = useState(today);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('pending');
  const [slot, setSlot] = useState<SlotFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<AdminReservation | null>(null);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'day-reservations', date],
    queryFn: () => getReservationsOfDay(date),
    refetchInterval: REFRESH_MS,
  });

  const reservations = useMemo(() => data?.reservations ?? [], [data]);
  const summary = data?.summary;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reservations.filter(
      (r) =>
        (status === 'all' || r.status === status) &&
        (slot === 'all' || r.pickup_time_slot === slot) &&
        (!term ||
          r.user.full_name.toLowerCase().includes(term) ||
          r.user.email.toLowerCase().includes(term) ||
          r.code.toLowerCase().includes(term))
    );
  }, [reservations, search, status, slot]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const visible = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const statusOptions: ChipOption<StatusFilter>[] = [
    { value: 'pending', label: `Pendientes (${summary?.pending ?? 0})` },
    { value: 'delivered', label: `Entregadas (${summary?.delivered ?? 0})` },
    { value: 'cancelled', label: `Canceladas (${summary?.cancelled ?? 0})` },
    { value: 'expired', label: `Vencidas (${summary?.expired ?? 0})` },
    { value: 'all', label: `Todas (${summary?.total ?? 0})` },
  ];

  // Entregar o cancelar cambia las listas, las cifras del panel y el stock de los menús
  const refreshAll = () => {
    ['admin', 'menus'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
  };

  const deliver = useMutation({
    mutationFn: (reservation: AdminReservation) => deliverReservation(reservation.id),
    onSuccess: (reservation) => {
      toast.success('¡Pedido entregado!', { description: `${reservation.user.full_name} · ${reservation.code}` });
      refreshAll();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      refreshAll();
    },
  });

  const cancel = useMutation({
    mutationFn: (reservation: AdminReservation) => cancelReservationAdmin(reservation.id),
    onSuccess: () => {
      toast.success('Reserva cancelada', { description: 'La porción volvió al stock' });
      setCancelTarget(null);
      refreshAll();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      setCancelTarget(null);
      refreshAll();
    },
  });

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setSlot('all');
    setCurrentPage(1);
  };

  const busyId = deliver.isPending ? deliver.variables?.id : cancel.isPending ? cancel.variables?.id : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Despacho</h2>
          <p className="text-sm text-muted-foreground">Gestiona las entregas de pedidos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 font-semibold" onClick={() => setCodeDialogOpen(true)}>
            <QrCode className="w-4 h-4 mr-2" />
            Entregar por código
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Actualizar reservas"
            title="Actualizar"
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-pulse')} />
          </Button>
        </div>
      </div>

      <AdminToolbar
        search={search}
        onSearchChange={resetPage(setSearch)}
        searchPlaceholder="Buscar por nombre, correo o código..."
      >
        <div className="flex items-center gap-2">
          <label htmlFor="dispatch-date" className="text-sm font-medium">
            Fecha
          </label>
          <Input id="dispatch-date" type="date" value={date} onChange={(e) => e.target.value && resetPage(setDate)(e.target.value)} className="w-auto" />
          {date !== today && (
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => resetPage(setDate)(today)}>
              Hoy
            </Button>
          )}
        </div>
        <div className="flex basis-full flex-wrap gap-x-6 gap-y-2">
          <ChipGroup value={status} options={statusOptions} onChange={(value) => resetPage(setStatus)(value)} ariaLabel="Estado" />
          <ChipGroup value={slot} options={SLOT_OPTIONS} onChange={(value) => resetPage(setSlot)(value)} ariaLabel="Hora de recojo" />
        </div>
      </AdminToolbar>

      {isLoading ? (
        <AdminReservationGridSkeleton className={CARD_GRID_COLUMNS} />
      ) : isError ? (
        <ErrorState title="No se pudieron cargar las reservas" onRetry={() => refetch()} />
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={Package}
          title={date === today ? 'Aún no hay reservas para hoy' : 'No hay reservas para esta fecha'}
          description="Cuando los usuarios reserven, aparecerán aquí."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No hay reservas con estos filtros"
          description="Prueba con otro estado, hora o búsqueda"
          action={{ label: 'Ver todas', onClick: clearFilters }}
        />
      ) : (
        <>
          <ResultsSummary count={filtered.length} singular="reserva" plural="reservas" />
          <div className={cn('grid gap-5', CARD_GRID_COLUMNS)}>
            {visible.map((reservation) => (
              <AdminReservationCard
                key={reservation.id}
                reservation={reservation}
                busy={busyId === reservation.id}
                onDeliver={(r) => deliver.mutate(r)}
                onCancel={setCancelTarget}
              />
            ))}
          </div>
          <PaginationBar page={page} totalPages={totalPages} onChange={setCurrentPage} />
        </>
      )}

      {codeDialogOpen && <DeliverByCodeDialog onClose={() => setCodeDialogOpen(false)} />}

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancelar reserva"
        description={
          cancelTarget && (
            <>
              Se cancelará la reserva <strong>{cancelTarget.code}</strong> de {cancelTarget.user.full_name} y la porción volverá al
              stock. No se puede deshacer.
            </>
          )
        }
        confirmLabel="Cancelar reserva"
        busyLabel="Cancelando..."
        busy={cancel.isPending}
        onConfirm={() => cancelTarget && cancel.mutate(cancelTarget)}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  );
}
