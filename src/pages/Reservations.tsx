import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Package, SearchX } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/api';
import { parseLocalDate } from '@/lib/dates';
import { CARD_GRID_COLUMNS } from '@/lib/layout';
import { cancelReservation, getUserReservations } from '@/services/reservations';
import type { UserReservation } from '@/types';
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PaginationBar from '@/components/PaginationBar';
import ResultsSummary from '@/components/ResultsSummary';
import { EmptyState, ErrorState } from '@/components/StateMessages';
import CancelReservationDialog from '@/components/reservations/CancelReservationDialog';
import ReservationCard, { ReservationGridSkeleton } from '@/components/reservations/ReservationCard';
import ReservationDetailDialog from '@/components/reservations/ReservationDetailDialog';
import ReservationFilters, { type StatusFilter } from '@/components/reservations/ReservationFilters';

// 12 llena filas completas con 2, 3 o 4 columnas de tarjetas
const ITEMS_PER_PAGE = 12;

export default function Reservations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [date, setDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  // Se guarda el id (no la reserva) para que el detalle siempre muestre los datos más recientes
  const [detailId, setDetailId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<UserReservation | null>(null);

  // El backend devuelve las últimas 50 reservas, de la más reciente a la más antigua (RF-007)
  const { data: reservations = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['reservations', 'user'],
    queryFn: getUserReservations,
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reservations.filter((r) => {
      if (status !== 'all' && r.status !== status) return false;
      if (date && r.reservation_date !== date) return false;
      if (!term) return true;

      const dateText = format(parseLocalDate(r.reservation_date), "d 'de' MMMM", { locale: es }).toLowerCase();
      return (
        r.code.toLowerCase().includes(term) ||
        r.menu.main_dish?.toLowerCase().includes(term) ||
        r.reservation_date.includes(term) ||
        dateText.includes(term)
      );
    });
  }, [reservations, search, status, date]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const visible = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const detail = reservations.find((r) => r.id === detailId) ?? null;

  const changeFilter = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setDate('');
    setCurrentPage(1);
  };

  const cancel = useMutation({
    mutationFn: (reservation: UserReservation) => cancelReservation(reservation.id),
    onSuccess: () => {
      toast.success('Reserva cancelada exitosamente');
      setCancelTarget(null);
      // Al cancelar, la porción vuelve al stock y el turno queda libre
      ['reservations', 'menus', 'slots'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      setCancelTarget(null);
    },
  });

  const askCancel = (reservation: UserReservation) => {
    setDetailId(null);
    setCancelTarget(reservation);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1 text-primary">Mis Reservas</h1>
          <p className="text-muted-foreground">Historial de tus últimos pedidos y códigos de recojo</p>
        </div>

        <div className="grid gap-6 items-start lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
          <aside className="lg:sticky lg:top-24">
            <ReservationFilters
              search={search}
              onSearchChange={changeFilter(setSearch)}
              status={status}
              onStatusChange={changeFilter(setStatus)}
              date={date}
              onDateChange={changeFilter(setDate)}
              onClear={clearFilters}
            />
          </aside>

          <section className="min-w-0" aria-label="Mis reservas">
            {isLoading ? (
              <ReservationGridSkeleton />
            ) : isError ? (
              <ErrorState title="No se pudieron cargar tus reservas" onRetry={() => refetch()} />
            ) : reservations.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No tienes reservas"
                description="¡Realiza tu primera reserva desde el menú!"
                action={{ label: 'Ver menús', onClick: () => navigate('/menus/user') }}
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No se encontraron reservas"
                description="Prueba con otro filtro o término de búsqueda"
                action={{ label: 'Quitar filtros', onClick: clearFilters }}
              />
            ) : (
              <>
                <ResultsSummary count={filtered.length} singular="reserva" plural="reservas" />
                <div className={cn('grid gap-5 mb-6', CARD_GRID_COLUMNS)}>
                  {visible.map((reservation) => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onDetail={(r) => setDetailId(r.id)}
                      onCancel={askCancel}
                    />
                  ))}
                </div>
                <PaginationBar page={page} totalPages={totalPages} onChange={setCurrentPage} />
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />

      <ReservationDetailDialog
        reservation={detail}
        holder={{ name: user?.full_name ?? '', email: user?.email ?? '' }}
        onClose={() => setDetailId(null)}
        onCancel={askCancel}
      />
      <CancelReservationDialog
        reservation={cancelTarget}
        cancelling={cancel.isPending}
        onConfirm={() => cancelTarget && cancel.mutate(cancelTarget)}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  );
}
