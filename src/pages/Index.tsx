import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getTodayMenu } from '@/services/menus';
import type { DailyMenu } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Calendar, Clock, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [todayMenu, setTodayMenu] = useState<DailyMenu | null>(null);
  const [loadingMenu, setLoadingMenu] = useState(true);

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/menus/user');
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-6 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-primary via-primary to-accent p-8 rounded-3xl shadow-2xl shadow-primary/20">
              <UtensilsCrossed className="w-20 h-20 md:w-24 md:h-24 text-accent" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent tracking-tight">
              KAVAS-LUNCH
            </h1>
            <p className="text-2xl md:text-3xl text-foreground font-semibold max-w-2xl mx-auto">
              Sistema de Reservas del Comedor Universitario
            </p>
            <p className="text-xl text-primary/80 font-medium">
              Universidad Peruana Cayetano Heredia
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
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
          <div className="grid md:grid-cols-3 gap-8 pt-20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-450">
            <div className="bg-card p-8 rounded-2xl border-2 border-primary/30 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto shadow-md">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-primary">Reserva Anticipada</h3>
              <p className="text-muted-foreground">
                Reserva tu almuerzo con anticipación y evita las colas del comedor
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl border-2 border-accent/40 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all">
              <div className="bg-gradient-to-br from-accent/20 to-primary/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto shadow-md">
                <Clock className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-primary">Recojo Rápido</h3>
              <p className="text-muted-foreground">
                Usa tu código único para recoger tu pedido sin demoras
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl border-2 border-success/30 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all">
              <div className="bg-gradient-to-br from-success/20 to-accent/20 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto shadow-md">
                <ShieldCheck className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-primary">Seguro y Confiable</h3>
              <p className="text-muted-foreground">
                Acceso exclusivo con tu correo institucional @upch.pe
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Menu Section */}
      {!loadingMenu && todayMenu && (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              🍽️ Menú del Día
            </h2>
            <Card className="overflow-hidden border-2 border-primary/20 shadow-2xl">
              <CardHeader className="bg-gradient-to-br from-primary/15 to-accent/25 border-b-2 border-accent/30 pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-primary">
                    {new Date(todayMenu.date).toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </CardTitle>
                  <div className="text-3xl font-bold text-primary">
                    S/ {typeof todayMenu.price === 'number' ? todayMenu.price.toFixed(2) : todayMenu.price}
                  </div>
                </div>
                <CardDescription className="text-lg mt-2">
                  {todayMenu.stock > 0 ? `${todayMenu.stock} porciones disponibles` : 'Agotado'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {todayMenu.appetizer && (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-primary uppercase">🥗 Entrada</p>
                    <p className="text-xl font-semibold">{todayMenu.appetizer.name}</p>
                    <p className="text-muted-foreground">{todayMenu.appetizer.description}</p>
                  </div>
                )}
                {todayMenu.main_dish && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm font-bold text-primary uppercase">🍖 Plato Principal</p>
                    {todayMenu.main_dish.image_url && (
                      <img 
                        src={todayMenu.main_dish.image_url} 
                        alt={todayMenu.main_dish.name}
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                      />
                    )}
                    <p className="text-xl font-semibold">{todayMenu.main_dish.name}</p>
                    <p className="text-muted-foreground">{todayMenu.main_dish.description}</p>
                  </div>
                )}
                {todayMenu.drink && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm font-bold text-primary uppercase">🥤 Bebida</p>
                    <p className="text-xl font-semibold">{todayMenu.drink.name}</p>
                    <p className="text-muted-foreground">{todayMenu.drink.description}</p>
                  </div>
                )}
                <Button 
                  onClick={() => navigate(user ? '/menus/user' : '/menus')}
                  className="w-full mt-6 text-lg py-6 bg-gradient-to-r from-primary to-accent"
                  size="lg"
                >
                  Ver Todos los Menús <ArrowRight className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t-2 border-primary/20 mt-16 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-foreground font-medium">© 2025 KAVAS-LUNCH. Universidad Peruana Cayetano Heredia.</p>
          <p className="text-sm text-muted-foreground mt-2">Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
