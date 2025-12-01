import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getTodayMenu } from '@/services/menus';
import type { DailyMenu } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Calendar, Clock, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [todayMenu, setTodayMenu] = useState<DailyMenu | null>(null);
  const [loadingMenu, setLoadingMenu] = useState(true);

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
    const fetchTodayMenu = async () => {
      try {
        const menu = await getTodayMenu();
        setTodayMenu(menu);
      } catch (error) {
        console.error('Error loading today menu:', error);
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchTodayMenu();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/20 flex flex-col">
      {/* Hero Section */}
      <div className="flex-grow container mx-auto px-4 py-16 md:py-24 flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto w-full">
          {/* Left Column: Login/Info Section */}
          <div className="text-center lg:text-left space-y-8">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start mb-6 animate-in fade-in duration-500">
              <div className="bg-gradient-to-br from-primary via-primary to-accent p-8 rounded-3xl shadow-2xl shadow-primary/20">
                <UtensilsCrossed className="w-20 h-20 md:w-24 md:h-24 text-accent" />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent tracking-tight">
                KAVAS-LUNCH
              </h1>
              <p className="text-xl md:text-2xl text-foreground font-semibold">
                Sistema de Reservas del Comedor Universitario
              </p>
              <p className="text-lg text-primary/80 font-medium">
                Universidad Peruana Cayetano Heredia
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Acceder al Sistema
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-450">
              <div className="bg-card p-6 rounded-2xl border-2 border-primary/30 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md">
                  <Calendar className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-base mb-2 text-primary text-center">Reserva Anticipada</h3>
                <p className="text-xs text-muted-foreground text-center">
                  Reserva tu almuerzo con anticipación y evita las colas del comedor
                </p>
              </div>

              <div className="bg-card p-6 rounded-2xl border-2 border-accent/40 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                <div className="bg-gradient-to-br from-accent/20 to-primary/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md">
                  <Clock className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-bold text-base mb-2 text-primary text-center">Recojo Rápido</h3>
                <p className="text-xs text-muted-foreground text-center">
                  Usa tu código único para recoger tu pedido sin demoras
                </p>
              </div>

              <div className="bg-card p-6 rounded-2xl border-2 border-success/30 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                <div className="bg-gradient-to-br from-success/20 to-accent/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 mx-auto shadow-md">
                  <ShieldCheck className="w-7 h-7 text-success" />
                </div>
                <h3 className="font-bold text-base mb-2 text-primary text-center">Seguro y Confiable</h3>
                <p className="text-xs text-muted-foreground text-center">
                  Acceso exclusivo con tu correo institucional @upch.pe
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Today's Menu */}
          {!loadingMenu && todayMenu && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                🍽️ Menú del Día
              </h2>
              <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl sticky top-4">
                <CardHeader className="bg-gradient-to-br from-primary/15 to-accent/25 border-b-2 border-accent/30 pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-primary">
                      {new Date(todayMenu.date).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </CardTitle>
                    <div className="text-2xl font-bold text-primary">
                      S/ {typeof todayMenu.price === 'number' ? todayMenu.price.toFixed(2) : todayMenu.price}
                    </div>
                  </div>
                  <CardDescription className="text-base mt-2">
                    {todayMenu.stock > 0 ? `${todayMenu.stock} porciones disponibles` : 'Agotado'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-5">
                  {todayMenu.appetizer && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-primary uppercase">🥗 Entrada</p>
                      <p className="text-lg font-semibold">{todayMenu.appetizer.name}</p>
                      <p className="text-sm text-muted-foreground">{todayMenu.appetizer.description}</p>
                    </div>
                  )}
                  {todayMenu.main_dish && (
                    <div className="space-y-2 pt-3 border-t">
                      <p className="text-xs font-bold text-primary uppercase">🍖 Plato Principal</p>
                      {todayMenu.main_dish.image_url && (
                        <img 
                          src={todayMenu.main_dish.image_url} 
                          alt={todayMenu.main_dish.name}
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                      )}
                      <p className="text-lg font-semibold">{todayMenu.main_dish.name}</p>
                      <p className="text-sm text-muted-foreground">{todayMenu.main_dish.description}</p>
                    </div>
                  )}
                  {todayMenu.drink && (
                    <div className="space-y-2 pt-3 border-t">
                      <p className="text-xs font-bold text-primary uppercase">🥤 Bebida</p>
                      <p className="text-lg font-semibold">{todayMenu.drink.name}</p>
                      <p className="text-sm text-muted-foreground">{todayMenu.drink.description}</p>
                    </div>
                  )}
                  <Button 
                    onClick={() => navigate(user ? '/menus/user' : '/menus')}
                    className="w-full mt-4 text-base py-6 bg-gradient-to-r from-primary to-accent"
                    size="lg"
                  >
                    Ver Todos los Menús <ArrowRight className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
