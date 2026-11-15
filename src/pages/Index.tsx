import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getPublicMenus, type DailyMenu, type Dish } from '@/services/menus';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UtensilsCrossed, Calendar, CalendarX, Clock, RefreshCw, WifiOff, ShieldCheck, Sparkles, ArrowRight, Leaf, CupSoda, type LucideIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Footer from '@/components/Footer';
import DishImage from '@/components/DishImage';
import { parseLocalDate, todayISO } from '@/lib/dates';

const FEATURES: { icon: LucideIcon; title: string; text: string; border: string; iconBox: string }[] = [
  {
    icon: Calendar,
    title: 'Reserva Anticipada',
    text: 'Reserva tu almuerzo con anticipación y evita las colas del comedor',
    border: 'border-primary/30',
    iconBox: 'from-primary/20 to-accent/20 text-primary',
  },
  {
    icon: Clock,
    title: 'Recojo Rápido',
    text: 'Usa tu código único para recoger tu pedido sin demoras',
    border: 'border-accent/40',
    iconBox: 'from-accent/20 to-primary/20 text-[#C78F00]',
  },
  {
    icon: ShieldCheck,
    title: 'Seguro y Confiable',
    text: 'Acceso exclusivo con tu correo institucional @upch.pe',
    border: 'border-success/30',
    iconBox: 'from-success/20 to-accent/20 text-success',
  },
];

const MenuSection = ({ icon: Icon, label, dish, withImage = false }: { icon: LucideIcon; label: string; dish: Dish; withImage?: boolean }) => (
  <div className="space-y-2 py-4 first:pt-0">
    <p className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wide">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </p>
    {withImage && <DishImage dish={dish} className="h-48" />}
    <p className="text-lg font-semibold">{dish.name}</p>
    <p className="text-sm text-muted-foreground">{dish.description}</p>
  </div>
);

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [menu, setMenu] = useState<DailyMenu | null>(null);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState(false);

  // La tarjeta siempre se muestra: el menú de hoy o, si hoy no hay, el próximo publicado.
  // El backend devuelve los menús desde hoy ordenados por fecha.
  const fetchMenu = useCallback(async () => {
    setLoadingMenu(true);
    setMenuError(false);
    try {
      const menus = await getPublicMenus();
      setMenu(menus[0] ?? null);
    } catch (error) {
      console.error('Error loading menu:', error);
      setMenuError(true);
    } finally {
      setLoadingMenu(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      // Redirigir según el rol del usuario
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/menus/user');
      }
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isToday = menu?.date === todayISO();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/20 flex flex-col">
      {/* Hero Section */}
      <main className="flex-grow container mx-auto px-4 py-12 sm:py-24 flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto w-full">
          {/* Left Column: Info Section */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start">
              <span className="inline-flex bg-gradient-to-br from-primary via-primary to-accent p-8 rounded-3xl text-accent shadow-2xl shadow-primary/20">
                <UtensilsCrossed className="w-24 h-24" />
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-6">
              <h1 className="text-[44px] sm:text-6xl leading-none font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-[#E0A100] bg-clip-text text-transparent">
                KAVAS-LUNCH
              </h1>
              <p className="text-2xl font-semibold">Sistema de Reservas del Comedor Universitario</p>
              <p className="text-lg font-medium text-primary">Universidad Peruana Cayetano Heredia</p>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-8">
              <Button
                asChild
                size="lg"
                className="h-auto px-10 py-5 text-lg bg-gradient-to-r from-primary to-[#AE4747] hover:from-[#8A1616] hover:to-[#9E4040] shadow-lg"
              >
                <Link to="/auth">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Acceder al Sistema
                </Link>
              </Button>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-6 pt-12">
              {FEATURES.map(({ icon: Icon, title, text, border, iconBox }) => (
                <div
                  key={title}
                  className={`bg-card p-6 rounded-2xl border-2 ${border} shadow-xl flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-2xl`}
                >
                  <div className={`bg-gradient-to-br ${iconBox} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-base mb-2 text-primary">{title}</h3>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Menú del Día (siempre visible) */}
          <div>
            <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-[#E0A100] bg-clip-text text-transparent">
              Menú del Día
            </h2>
            <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl">
              {loadingMenu ? (
                // Misma estructura y medidas que la tarjeta cargada, para que no cambie de tamaño
                <div aria-busy="true" aria-label="Cargando menú">
                  <CardHeader className="bg-gradient-to-br from-primary/15 to-accent/25 border-b-2 border-accent/30">
                    <Skeleton className="h-5 w-24 rounded-full bg-background/60" />
                    <div className="flex items-center justify-between gap-4">
                      <Skeleton className="h-7 w-36 bg-background/60" />
                      <Skeleton className="h-8 w-24 bg-background/60" />
                    </div>
                    <Skeleton className="h-6 w-44 bg-background/60" />
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="divide-y">
                      {[false, true, false].map((withImage, i) => (
                        <div key={i} className="space-y-2 py-4 first:pt-0">
                          <Skeleton className="h-4 w-28" />
                          {withImage && <Skeleton className="h-48 w-full rounded-2xl" />}
                          <Skeleton className="h-7 w-1/2" />
                          <Skeleton className="h-5 w-4/5" />
                        </div>
                      ))}
                    </div>
                    <Skeleton className="w-full mt-4 h-14 rounded-2xl" />
                  </CardContent>
                </div>
              ) : menu ? (
                <>
                  <CardHeader className="bg-gradient-to-br from-primary/15 to-accent/25 border-b-2 border-accent/30">
                    {!isToday && (
                      <Badge className="w-fit bg-accent text-primary hover:bg-accent">Próximo menú</Badge>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="text-xl text-primary first-letter:uppercase">
                        {format(parseLocalDate(menu.date), 'EEEE, d MMM', { locale: es })}
                      </CardTitle>
                      <span className="text-2xl font-bold text-primary whitespace-nowrap">
                        S/ {Number(menu.price).toFixed(2)}
                      </span>
                    </div>
                    <CardDescription className="text-base">
                      {menu.stock > 0 ? `${menu.stock} porciones disponibles` : 'Agotado'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="divide-y">
                      {menu.appetizer && <MenuSection icon={Leaf} label="Entrada" dish={menu.appetizer} />}
                      {menu.main_dish && <MenuSection icon={UtensilsCrossed} label="Plato Principal" dish={menu.main_dish} withImage />}
                      {menu.drink && <MenuSection icon={CupSoda} label="Bebida" dish={menu.drink} />}
                    </div>
                    <Button
                      asChild
                      size="lg"
                      className="w-full mt-4 h-14 text-base bg-gradient-to-r from-primary to-[#B4530A] hover:from-[#8A1616] hover:to-[#9E4A09]"
                    >
                      <Link to="/menus">
                        Ver Todos los Menús <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </>
              ) : menuError ? (
                <CardContent className="p-6 pt-10 text-center" role="alert">
                  <WifiOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold">No se pudo cargar el menú</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    No hay conexión con el servidor. Inténtalo nuevamente en unos momentos.
                  </p>
                  <Button variant="outline" size="lg" className="w-full mt-6 h-14 text-base" onClick={fetchMenu}>
                    <RefreshCw className="w-5 h-5 mr-2" /> Reintentar
                  </Button>
                </CardContent>
              ) : (
                <CardContent className="p-6 pt-10 text-center">
                  <CalendarX className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold">Aún no hay menú publicado</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vuelve pronto para ver el menú del comedor
                  </p>
                  <Button asChild variant="outline" size="lg" className="w-full mt-6 h-14 text-base">
                    <Link to="/menus">
                      Ver Todos los Menús <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
