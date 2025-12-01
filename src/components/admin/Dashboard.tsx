import { useEffect, useState } from 'react';
import { getDashboardStats, getTodayReservations } from '@/services/admin';
import type { DashboardStats, Reservation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Package, TrendingUp, Users, Clock } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    today_reservations: 0,
    pending_reservations: 0,
    delivered_reservations: 0,
    today_revenue: 0,
    total_dishes: 0,
    active_menus: 0,
    low_stock_menus: 0,
  });
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener estadísticas del dashboard desde Laravel
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);

      // Obtener reservas de hoy
      const todayRes = await getTodayReservations();
      setRecentReservations(todayRes);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      confirmed: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      delivered: 'bg-green-500/10 text-green-700 dark:text-green-400',
      cancelled: 'bg-red-500/10 text-red-700 dark:text-red-400',
    };
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Resumen general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reservas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today_reservations}</div>
            <p className="text-xs text-muted-foreground mt-1">Reservas para hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entregas Pendientes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pending_reservations}</div>
            <p className="text-xs text-muted-foreground mt-1">Pedidos por entregar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">S/ {stats.today_revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Ingresos de hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Platos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_dishes}</div>
            <p className="text-xs text-muted-foreground mt-1">Platos en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Menús Activos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_menus}</div>
            <p className="text-xs text-muted-foreground mt-1">Menús disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Reservas Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          {recentReservations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No hay reservas para hoy</p>
          ) : (
            <div className="space-y-4">
              {recentReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{reservation.user?.full_name || reservation.user?.email || 'Usuario'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {reservation.pickup_time_slot || reservation.time_slot || 'Sin horario'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(reservation.status)}
                    <p className="text-xs text-muted-foreground mt-1">
                      S/ {typeof reservation.menu?.price === 'string' 
                        ? parseFloat(reservation.menu.price).toFixed(2) 
                        : reservation.menu?.price?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
