import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getPublicMenus } from '@/services/menus';
import type { DailyMenu } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Menus() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menus, setMenus] = useState<DailyMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>('today-tomorrow');
  const [stockFilter, setStockFilter] = useState<string>('all');

  // FASE 2: Esta es una página PÚBLICA - no requiere autenticación
  // Solo redirige al login cuando el usuario intenta reservar (ver handleReserve)

  useEffect(() => {
    fetchMenus();
  }, [dateFilter, stockFilter]);

  const getDateRange = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    switch (dateFilter) {
      case 'today-tomorrow':
        return { start: now, end: tomorrow };
      case 'this-week':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'next-week':
        return { start: startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 }), end: endOfWeek(addWeeks(now, 1), { weekStartsOn: 1 }) };
      case 'all':
      default:
        return null;
    }
  };

  const fetchMenus = async () => {
    try {
      setLoading(true);
      // Usar servicio de Laravel - endpoint público
      let allMenus = await getPublicMenus();
      
      // Aplicar filtros
      const dateRange = getDateRange();
      if (dateRange) {
        allMenus = allMenus.filter(menu => {
          const menuDate = new Date(menu.date);
          return menuDate >= dateRange.start && menuDate <= dateRange.end;
        });
      }

      if (stockFilter === 'available') {
        allMenus = allMenus.filter(menu => menu.stock > 0);
      } else if (stockFilter === 'low-stock') {
        allMenus = allMenus.filter(menu => menu.stock > 0 && menu.stock <= 10);
      }

      setMenus(allMenus);
    } catch (error: any) {
      console.error('Error fetching menus:', error);
      toast.error('Error al cargar los menús');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (menuId: string, menuDate: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para reservar');
      navigate('/auth');
      return;
    }
    
    try {
      // TODO: Verificar reservas existentes cuando se implemente FASE 4
      // Por ahora solo navegar a la página de reserva
      navigate(`/reserve/${menuId}`);
    } catch (error: any) {
      console.error('Error checking reservation:', error);
      toast.error('Error al verificar reservas');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Cargando menús...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex flex-col">
      <Header />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Menús de la Semana</h2>
          <p className="text-muted-foreground">Reserva tu almuerzo con anticipación y recoge con tu código</p>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="text-xl flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Fecha</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today-tomorrow">Hoy y Mañana</SelectItem>
                    <SelectItem value="this-week">Esta Semana</SelectItem>
                    <SelectItem value="next-week">Próxima Semana</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Disponibilidad</label>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="available">Solo Disponibles</SelectItem>
                    <SelectItem value="low-stock">Pocas Unidades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {menus.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No hay menús disponibles con los filtros seleccionados</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {menus.map((menu) => (
              <Card key={menu.id} className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-primary/20">
                <CardHeader className="bg-gradient-to-br from-primary/15 to-accent/25 border-b-2 border-accent/30 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg text-primary">
                        {format(new Date(menu.date), "EEEE", { locale: es })}
                      </CardTitle>
                    </div>
                    <Badge className={menu.stock > 10 ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                      {menu.stock} disponibles
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {format(new Date(menu.date), "d 'de' MMMM, yyyy", { locale: es })}
                  </CardDescription>
                  <div className="mt-3 pt-3 border-t border-accent/20">
                    <CardDescription className="text-3xl font-bold text-primary">
                      S/ {typeof menu.price === 'number' ? menu.price.toFixed(2) : menu.price}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-4">
                  {menu.appetizer && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                        <p className="text-xs font-bold text-primary uppercase tracking-wide">Entrada</p>
                      </div>
                      {menu.appetizer.image_url && (
                        <img 
                          src={menu.appetizer.image_url} 
                          alt={menu.appetizer.name}
                          className="w-full h-32 object-cover rounded-lg shadow-md hover:scale-105 transition-transform"
                        />
                      )}
                      <p className="font-semibold text-base">{menu.appetizer.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{menu.appetizer.description}</p>
                    </div>
                  )}

                  {menu.main_dish && (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                        <p className="text-xs font-bold text-primary uppercase tracking-wide">Plato Principal</p>
                      </div>
                      {menu.main_dish.image_url && (
                        <img 
                          src={menu.main_dish.image_url} 
                          alt={menu.main_dish.name}
                          className="w-full h-32 object-cover rounded-lg shadow-md hover:scale-105 transition-transform"
                        />
                      )}
                      <p className="font-semibold text-base">{menu.main_dish.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{menu.main_dish.description}</p>
                    </div>
                  )}

                  {menu.drink && (
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                        <p className="text-xs font-bold text-primary uppercase tracking-wide">Bebida</p>
                      </div>
                      {menu.drink.image_url && (
                        <img 
                          src={menu.drink.image_url} 
                          alt={menu.drink.name}
                          className="w-full h-32 object-cover rounded-lg shadow-md hover:scale-105 transition-transform"
                        />
                      )}
                      <p className="font-semibold text-base">{menu.drink.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{menu.drink.description}</p>
                    </div>
                  )}

                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-base py-5 font-semibold" 
                    disabled={menu.stock === 0}
                    onClick={() => handleReserve(menu.id, menu.date)}
                  >
                    {menu.stock === 0 ? '🔴 Agotado' : '🍽️ Reservar Menú'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
