import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Mail, Package, TrendingUp, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { computeProfileStats } from '@/lib/profileStats';
import { getUserReservations } from '@/services/reservations';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatCard, { StatCardSkeleton } from '@/components/StatCard';
import FavoriteDishCard, { FavoriteDishCardSkeleton } from '@/components/profile/FavoriteDishCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const InfoItem = ({ icon: Icon, label, children }: { icon: typeof User; label: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
    <Icon className="w-5 h-5 shrink-0 text-primary" />
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="font-semibold truncate">{children}</div>
    </div>
  </div>
);

export default function Profile() {
  const { user } = useAuth();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ['reservations', 'user'],
    queryFn: getUserReservations,
  });

  // Si la carga falla se muestran las estadísticas en cero, como antes: el perfil sigue siendo útil
  const stats = useMemo(() => computeProfileStats(reservations ?? []), [reservations]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-4xl flex-grow">
        <Button asChild variant="ghost" className="mb-4">
          <Link to="/menus/user">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>
        </Button>

        <div className="space-y-4">
          <Card className="p-4">
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <User className="w-5 h-5 text-primary" />
              Mi Perfil
            </h1>
            <p className="text-sm text-muted-foreground mb-3">Información de tu cuenta</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <InfoItem icon={User} label="Nombre Completo">
                {user?.full_name}
              </InfoItem>
              <InfoItem icon={Mail} label="Email Institucional">
                {user?.email}
              </InfoItem>
              <InfoItem icon={Calendar} label="Rol">
                <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                  {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                </Badge>
              </InfoItem>
            </div>
          </Card>

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              [0, 1, 2, 3].map((i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard title="Total de Reservas" icon={Package} value={stats.total} caption="Pedidos realizados" />
                <StatCard
                  title="Total Gastado"
                  icon={TrendingUp}
                  value={`S/ ${stats.spent.toFixed(2)}`}
                  caption="En órdenes entregadas"
                  valueClassName="text-success"
                />
                <StatCard title="Día Favorito" icon={Calendar} value={stats.favoriteDay ?? 'N/A'} caption="Día que más ordenas" />
                <StatCard
                  title="Pedidos Pendientes"
                  icon={Package}
                  value={stats.pending}
                  caption="Por recoger"
                  valueClassName="text-warning"
                />
              </>
            )}
          </div>

          {isLoading ? <FavoriteDishCardSkeleton /> : stats.favoriteDish && <FavoriteDishCard dish={stats.favoriteDish} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
