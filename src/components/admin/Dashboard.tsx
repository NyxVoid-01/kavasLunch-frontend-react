import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Ban, CalendarCheck, CheckCircle, Clock, TrendingUp, UtensilsCrossed, Package } from 'lucide-react';
import { getDashboardStats, getReservationsOfDay } from '@/services/admin';
import { todayISO } from '@/lib/dates';
import TodayReservationsCard, { TodayReservationsCardSkeleton } from '@/components/admin/dashboard/TodayReservationsCard';
import StatCard, { StatCardSkeleton } from '@/components/StatCard';
import { ErrorState } from '@/components/StateMessages';

const REFRESH_MS = 30_000;
const STAT_GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4';
const STAT_COUNT = 8;

export default function Dashboard() {
  const today = todayISO();

  const stats = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: getDashboardStats, refetchInterval: REFRESH_MS });
  // Misma consulta que el despacho: se comparte la caché del día
  const day = useQuery({
    queryKey: ['admin', 'day-reservations', today],
    queryFn: () => getReservationsOfDay(today),
    refetchInterval: REFRESH_MS,
  });

  const header = (
    <div>
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p className="text-sm text-muted-foreground">Resumen general del sistema</p>
    </div>
  );

  if (stats.isError || day.isError) {
    return (
      <div className="space-y-4">
        {header}
        <ErrorState
          title="No se pudo cargar el resumen"
          onRetry={() => {
            stats.refetch();
            day.refetch();
          }}
        />
      </div>
    );
  }

  if (!stats.data || !day.data) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Cargando resumen">
        {header}
        <div className={STAT_GRID}>
          {Array.from({ length: STAT_COUNT }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <TodayReservationsCardSkeleton />
      </div>
    );
  }

  const s = stats.data;
  const summary = day.data.summary;

  return (
    <div className="space-y-4">
      {header}

      <div className={STAT_GRID}>
        <StatCard title="Reservas Hoy" icon={CalendarCheck} value={s.today_reservations} caption="Reservas vigentes de hoy" />
        <StatCard title="Entregas Pendientes" icon={Clock} value={s.pending_reservations} caption="Pedidos por entregar" valueClassName="text-warning" />
        <StatCard title="Entregados" icon={CheckCircle} value={s.delivered_reservations} caption="Pedidos entregados hoy" valueClassName="text-success" />
        <StatCard title="Ingresos Hoy" icon={TrendingUp} value={`S/ ${Number(s.today_revenue).toFixed(2)}`} caption="Sin canceladas ni vencidas" valueClassName="text-success" />
        <StatCard title="Menús Activos" icon={UtensilsCrossed} value={s.active_menus} caption="Menús disponibles" />
        <StatCard
          title="Stock Bajo"
          icon={AlertTriangle}
          value={s.low_stock_menus}
          caption="Menús con 10 porciones o menos"
          valueClassName={s.low_stock_menus > 0 ? 'text-destructive' : 'text-primary'}
        />
        <StatCard title="Platos Activos" icon={Package} value={s.total_dishes} caption="Platos en el sistema" />
        <StatCard
          title="Canceladas / Vencidas"
          icon={Ban}
          value={summary.cancelled + summary.expired}
          caption="De las reservas de hoy"
          valueClassName="text-muted-foreground"
        />
      </div>

      <TodayReservationsCard reservations={day.data.reservations} />
    </div>
  );
}
