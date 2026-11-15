import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CalendarCheck, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/api';
import { getReservationAvailability } from '@/lib/reservationRules';
import { getUserMenuById, MENUS_REFRESH_MS } from '@/services/menus';
import { createReservation, getAvailableSlots, getUserReservations } from '@/services/reservations';
import { getPaymentMethods, processPayment } from '@/services/payments';
import type { ProcessPaymentData, UserReservation } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReservationSuccessModal from '@/components/ReservationSuccessModal';
import MenuSummaryCard, { MenuSummaryCardSkeleton } from '@/components/reserve/MenuSummaryCard';
import ReserveFormCard, { ReserveFormCardSkeleton } from '@/components/reserve/ReserveFormCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function Reserve() {
  const { menuId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [slot, setSlot] = useState('');
  const [method, setMethod] = useState('');
  const [created, setCreated] = useState<UserReservation | null>(null);

  // La ruta ya exige sesión (ProtectedRoute)
  const menuQuery = useQuery({
    queryKey: ['menu', menuId],
    queryFn: () => getUserMenuById(menuId),
    enabled: !!menuId,
    retry: false,
  });
  const menu = menuQuery.data;

  const slotsQuery = useQuery({
    queryKey: ['slots', menuId, menu?.date],
    queryFn: () => getAvailableSlots(menuId, menu!.date),
    enabled: !!menu,
    refetchInterval: MENUS_REFRESH_MS,
  });

  const methodsQuery = useQuery({
    queryKey: ['payment-methods'],
    queryFn: getPaymentMethods,
    staleTime: Infinity,
  });

  const reservationsQuery = useQuery({
    queryKey: ['reservations', 'user'],
    queryFn: getUserReservations,
  });

  useEffect(() => {
    if (menuQuery.isError) {
      toast.error('No se pudo cargar el menú');
      navigate('/menus/user', { replace: true });
    }
  }, [menuQuery.isError, navigate]);

  // Turno elegido: el primero libre; si el elegido se llena o termina, pasa al siguiente libre
  useEffect(() => {
    const slots = slotsQuery.data;
    if (!slots) return;
    if (!slots.find((s) => s.value === slot)?.available) {
      setSlot(slots.find((s) => s.available)?.value ?? '');
    }
  }, [slotsQuery.data, slot]);

  // Método de pago por defecto: efectivo, como en el prototipo
  useEffect(() => {
    const methods = methodsQuery.data;
    if (!methods || method) return;
    setMethod((methods.find((m) => m.id === 'cash' && m.enabled) ?? methods.find((m) => m.enabled))?.id ?? '');
  }, [methodsQuery.data, method]);

  // Una reserva activa por día: si ya existe, se avisa antes de que el usuario complete el formulario
  const existing = menu
    ? reservationsQuery.data?.find(
        (r) => r.reservation_date?.slice(0, 10) === menu.date && (r.status === 'pending' || r.status === 'delivered')
      )
    : undefined;
  const availability = menu ? getReservationAvailability(menu) : null;
  const blocked = !!existing || (!!availability && !availability.canReserve);

  const reserve = useMutation({
    mutationFn: async () => {
      if (!menu) throw new Error('Menú no cargado');

      const reservation = await createReservation({
        menu_id: menu.id,
        reservation_date: menu.date,
        pickup_time_slot: slot,
        payment_method: method,
      });

      // La reserva ya existe: si el pago falla, no se pierde; queda pendiente de cobro
      try {
        const result = await processPayment({
          reservation_id: reservation.id,
          payment_method: method as ProcessPaymentData['payment_method'],
        });
        return { reservation: { ...reservation, payment_status: result.reservation.payment_status }, paymentFailed: false };
      } catch (error) {
        console.error('Error processing payment:', error);
        return { reservation, paymentFailed: true };
      }
    },
    onSuccess: ({ reservation, paymentFailed }) => {
      setCreated(reservation);
      // El stock y los turnos cambiaron
      ['menus', 'slots', 'reservations'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));

      if (paymentFailed) {
        toast.warning('Reserva creada: el pago quedó pendiente', { description: 'Podrás pagar en caja al recoger tu pedido' });
      } else if (method === 'cash') {
        toast.success('¡Reserva creada!', { description: 'Pagarás al recoger tu pedido' });
      } else {
        toast.success('¡Todo listo!', { description: 'Pago registrado' });
      }
    },
    onError: (error) => {
      // Si alguien tomó el turno o el stock mientras tanto, se refresca lo que se muestra
      ['menus', 'slots', 'reservations'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      toast.error(getErrorMessage(error));
    },
  });

  const goToReservations = () => navigate('/reservations');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-6xl flex-grow">
        <Button asChild variant="ghost" className="mb-4 text-primary hover:text-primary/80 hover:bg-primary/10">
          <Link to="/menus/user">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Menús
          </Link>
        </Button>

        {/* Avisos: se muestran antes de que el usuario complete el formulario */}
        {existing && (
          <Alert className="mb-4 border-primary/30 bg-primary/5">
            <CalendarCheck className="h-4 w-4" />
            <AlertTitle>Ya tienes una reserva para este día</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
              <span>
                Código <strong>{existing.code}</strong>
                {existing.pickup_time_slot &&
                  ` · Horario ${existing.pickup_time_slot}${existing.pickup_window_end ? ` - ${existing.pickup_window_end}` : ''}`}
              </span>
              <Button size="sm" variant="outline" onClick={goToReservations}>
                Ver mis reservas
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {!existing && availability && !availability.canReserve && (
          <Alert className="mb-4 border-warning/50 bg-warning/10">
            <Info className="h-4 w-4" />
            <AlertTitle>{availability.label}</AlertTitle>
            <AlertDescription>
              Las reservas se hacen para hoy o mañana, de lunes a viernes, hasta las 15:00.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          <div className="lg:col-span-3">
            {menu ? <MenuSummaryCard menu={menu} /> : <MenuSummaryCardSkeleton />}
          </div>

          <div className="lg:col-span-2 lg:sticky lg:top-24">
            {menu ? (
              <ReserveFormCard
                slots={slotsQuery.data}
                slotsLoading={slotsQuery.isLoading}
                slot={slot}
                onSlotChange={setSlot}
                methods={methodsQuery.data}
                methodsLoading={methodsQuery.isLoading}
                method={method}
                onMethodChange={setMethod}
                onSubmit={() => reserve.mutate()}
                submitting={reserve.isPending}
                blocked={blocked}
              />
            ) : (
              <ReserveFormCardSkeleton />
            )}
          </div>
        </div>
      </main>

      {created && (
        <ReservationSuccessModal
          open
          onClose={goToReservations}
          onViewReservations={goToReservations}
          reservation={created}
          userEmail={user?.email || ''}
        />
      )}
      <Footer />
    </div>
  );
}
