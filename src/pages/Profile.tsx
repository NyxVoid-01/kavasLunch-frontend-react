import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile } from '@/services/auth';
import { getUserReservations } from '@/services/reservations';
import type { Reservation } from '@/types';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Calendar, TrendingUp, Package, Award } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Stats {
  totalReservations: number;
  totalSpent: number;
  favoriteDay: string;
  mostOrderedDish: string;
  pendingReservations: number;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchStats();
    }
  }, [user, authLoading, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Obtener todas las reservas del usuario desde el backend Laravel
      const reservations: Reservation[] = await getUserReservations();

      if (reservations && reservations.length > 0) {
        // Total reservations
        const totalReservations = reservations.length;

        // Total spent (only delivered orders)
        const totalSpent = reservations
          .filter(r => r.status === 'delivered')
          .reduce((sum, r) => {
            const price = typeof r.menu?.price === 'string' 
              ? parseFloat(r.menu.price) 
              : (r.menu?.price || 0);
            return sum + price;
          }, 0);

        // Pending reservations
        const pendingReservations = reservations.filter(r => r.status === 'pending').length;

        // Favorite day of week
        const dayCount: Record<string, number> = {};
        reservations.forEach(r => {
          const day = format(new Date(r.reservation_date), 'EEEE', { locale: es });
          dayCount[day] = (dayCount[day] || 0) + 1;
        });
        const favoriteDay = Object.keys(dayCount).length > 0
          ? Object.keys(dayCount).reduce((a, b) => 
              dayCount[a] > dayCount[b] ? a : b
            )
          : 'N/A';

        // Most ordered dish (plato principal del menú)
        const dishCount: Record<string, number> = {};
        reservations.forEach(r => {
          const dishName = r.menu?.main_dish?.name;
          if (dishName) {
            dishCount[dishName] = (dishCount[dishName] || 0) + 1;
          }
        });
        const mostOrderedDish = Object.keys(dishCount).length > 0
          ? Object.keys(dishCount).reduce((a, b) => 
              dishCount[a] > dishCount[b] ? a : b
            )
          : 'N/A';

        setStats({
          totalReservations,
          totalSpent,
          favoriteDay,
          mostOrderedDish,
          pendingReservations,
        });
      } else {
        // Si no hay reservas, inicializar stats en cero
        setStats({
          totalReservations: 0,
          totalSpent: 0,
          favoriteDay: 'N/A',
          mostOrderedDish: 'N/A',
          pendingReservations: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Inicializar stats vacíos en caso de error
      setStats({
        totalReservations: 0,
        totalSpent: 0,
        favoriteDay: 'N/A',
        mostOrderedDish: 'N/A',
        pendingReservations: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/menus/user')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <div className="space-y-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <User className="w-6 h-6 text-primary" />
                Mi Perfil
              </CardTitle>
              <CardDescription>Información de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Nombre Completo</p>
                  <p className="text-lg font-semibold">{user?.full_name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Email Institucional</p>
                  <p className="text-lg font-semibold">{user?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'} className="text-sm">
                  {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          {stats && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{stats.totalReservations}</div>
                    <p className="text-xs text-muted-foreground mt-1">Pedidos realizados</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-success">S/ {stats.totalSpent.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">En órdenes entregadas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Día Favorito</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary capitalize">{stats.favoriteDay}</div>
                    <p className="text-xs text-muted-foreground mt-1">Día que más ordenas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-warning">{stats.pendingReservations}</div>
                    <p className="text-xs text-muted-foreground mt-1">Por recoger</p>
                  </CardContent>
                </Card>
              </div>

              {/* Favorite Dish */}
              {stats.mostOrderedDish !== 'N/A' && (
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      Tu Plato Favorito
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{stats.mostOrderedDish}</p>
                      <p className="text-sm text-muted-foreground mt-1">El plato que más has ordenado</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
