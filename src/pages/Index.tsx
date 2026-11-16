import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getPublicMenus, type DailyMenu } from '@/services/menus';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react';
import UpchLogo from '@/components/UpchLogo';
import Footer from '@/components/Footer';
import TodayMenuCard, { TodayMenuCardMessage, TodayMenuCardSkeleton } from '@/components/menus/TodayMenuCard';
import { todayISO } from '@/lib/dates';

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

const Index = () => {
  const { user } = useAuth();
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

  const signedIn = !!user;

  useEffect(() => {
    // Quien ya tiene sesión se redirige y no necesita el menú
    if (!signedIn) fetchMenu();
  }, [signedIn, fetchMenu]);

  // Con sesión, directo a su pantalla según el rol: sin esperas ni parpadeo del inicio
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/menus/user'} replace />;
  }

  const isToday = menu?.date === todayISO();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/20 flex flex-col">
      {/* Hero Section */}
      <main className="flex-grow container mx-auto px-4 py-8 lg:py-10 flex items-center">
        <div className="grid lg:grid-cols-2 gap-10 items-center max-w-7xl mx-auto w-full">
          {/* Left Column: Info Section */}
          <div className="space-y-5 text-center lg:text-left">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start">
              <UpchLogo className="h-28 drop-shadow-xl" />
            </div>

            {/* Heading */}
            <div className="space-y-3">
              <h1 className="text-[40px] sm:text-5xl xl:text-6xl leading-none font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-[#E0A100] bg-clip-text text-transparent">
                KAVAS-LUNCH
              </h1>
              <p className="text-xl font-semibold">Sistema de Reservas del Comedor Universitario</p>
              <p className="font-medium text-primary">Universidad Peruana Cayetano Heredia</p>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-base bg-gradient-to-r from-primary to-[#AE4747] hover:from-[#8A1616] hover:to-[#9E4040] shadow-lg"
              >
                <Link to="/auth">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Acceder al Sistema
                </Link>
              </Button>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              {FEATURES.map(({ icon: Icon, title, text, border, iconBox }) => (
                <div
                  key={title}
                  className={`bg-card p-4 rounded-2xl border-2 ${border} shadow-xl flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-2xl`}
                >
                  <div className={`bg-gradient-to-br ${iconBox} w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm mb-1 text-primary">{title}</h3>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Menú del Día (siempre visible) */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-[#E0A100] bg-clip-text text-transparent">
              Menú del Día
            </h2>
            {loadingMenu ? (
              <TodayMenuCardSkeleton />
            ) : menu ? (
              <TodayMenuCard menu={menu} isToday={isToday} />
            ) : (
              <TodayMenuCardMessage kind={menuError ? 'error' : 'empty'} onRetry={fetchMenu} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
