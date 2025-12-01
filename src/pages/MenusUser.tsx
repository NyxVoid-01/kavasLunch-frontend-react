import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserMenus } from '@/services/menus';
import type { DailyMenu } from '@/types';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, ChevronLeft, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';

const ITEMS_PER_PAGE = 6;

export default function MenusUser() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [menus, setMenus] = useState<DailyMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>('today-tomorrow');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMenus();
      setCurrentPage(1);
    }
  }, [user, dateFilter, stockFilter]);

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
      default:
        return { start: now, end: tomorrow };
    }
  };

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange();
      
      // Llamar al endpoint de Laravel con filtros
      let allMenus = await getUserMenus();
      
      // Filtrar por rango de fechas en el frontend
      const filtered = allMenus.filter(menu => {
        const menuDate = new Date(menu.date);
        return menuDate >= start && menuDate <= end;
      });

      // Filtrar por stock si es necesario
      let result = filtered;
      if (stockFilter === 'available') {
        result = filtered.filter(menu => menu.stock > 0);
      } else if (stockFilter === 'out') {
        result = filtered.filter(menu => menu.stock === 0);
      }

      setMenus(result);
    } catch (error: any) {
      console.error('Error fetching menus:', error);
      toast.error('Error al cargar los menús');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (menuId: string, menuDate: string) => {
    // TODO: Implementar verificación de reservas existentes en FASE 4
    // Por ahora solo navegar a la página de reserva
    navigate(`/reserve/${menuId}`);
  };

  const totalPages = Math.ceil(menus.length / ITEMS_PER_PAGE);
  const paginatedMenus = menus.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get recommended menus (top 3 with most stock)
  const recommendedMenus = [...menus]
    .filter(m => m.stock > 0)
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 3);

  if (authLoading || loading) {
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Recommendations Banner */}
        {recommendedMenus.length > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border-2 border-primary/20 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Recomendados de la Semana
                  </CardTitle>
                  <CardDescription className="text-base">Los menús más populares y con mayor disponibilidad</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {recommendedMenus.map((menu, idx) => (
                  <Card key={menu.id} className="border-2 border-primary/30 hover:border-primary transition-all hover:shadow-lg cursor-pointer" onClick={() => handleReserve(menu.id, menu.date)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-primary text-primary-foreground">Top {idx + 1}</Badge>
                        <Badge variant="outline" className="border-success text-success">
                          {menu.stock} disponibles
                        </Badge>
                      </div>
                      <CardTitle className="text-base">
                        {format(new Date(menu.date), "EEEE d 'de' MMM", { locale: es })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {menu.main_dish && (
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          <p className="text-sm font-medium">{menu.main_dish.name}</p>
                        </div>
                      )}
                      <p className="text-xl font-bold text-primary">S/ {typeof menu.price === 'number' ? menu.price.toFixed(2) : menu.price}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Menús Disponibles</h2>
          <p className="text-muted-foreground text-lg">Reserva tu almuerzo con anticipación y ahorra tiempo</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-2 border-border">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <span className="font-semibold text-lg">Filtros:</span>
              </div>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[200px] border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today-tomorrow">Hoy y Mañana</SelectItem>
                  <SelectItem value="this-week">Esta Semana</SelectItem>
                  <SelectItem value="next-week">Próxima Semana</SelectItem>
                </SelectContent>
              </Select>

              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[200px] border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="available">Disponibles</SelectItem>
                  <SelectItem value="out">Agotados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {menus.length === 0 ? (
          <Card className="text-center py-16 border-2 border-dashed">
            <CardContent>
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No hay menús disponibles para los filtros seleccionados</p>
              <p className="text-sm text-muted-foreground mt-2">Intenta cambiar los filtros o vuelve más tarde</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {paginatedMenus.map((menu) => (
                <Card key={menu.id} className="overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-primary/20 hover:border-primary/40 group">
                  <CardHeader className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border-b-2 border-accent/30 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg text-primary font-bold">
                          {format(new Date(menu.date), "EEEE", { locale: es })}
                        </CardTitle>
                      </div>
                      {menu.stock === 0 ? (
                        <Badge variant="destructive" className="font-semibold">
                          AGOTADO
                        </Badge>
                      ) : (
                        <Badge className={menu.stock > 10 ? 'bg-success/20 text-success border-success/50' : 'bg-warning/20 text-warning border-warning/50'}>
                          {menu.stock} disponibles
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm font-medium">
                      {format(new Date(menu.date), "d 'de' MMMM, yyyy", { locale: es })}
                    </CardDescription>
                    <div className="mt-3 pt-3 border-t border-accent/20">
                      <CardDescription className="text-3xl font-bold text-primary">
                        S/ {typeof menu.price === 'number' ? menu.price.toFixed(2) : menu.price}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-4">
                    {/* Main Dish Photo */}
                    {menu.main_dish?.image_url && (
                      <div className="w-full h-48 rounded-lg overflow-hidden shadow-lg border-2 border-border">
                        <img 
                          src={menu.main_dish.image_url} 
                          alt={menu.main_dish.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Menu Items */}
                    <div className="space-y-3">
                      {menu.appetizer && (
                        <div className="flex items-start gap-3 p-2 rounded-lg bg-accent/5">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                          <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-wide">Entrada</p>
                            <p className="font-semibold text-sm">{menu.appetizer.name}</p>
                          </div>
                        </div>
                      )}

                      {menu.main_dish && (
                        <div className="flex items-start gap-3 p-2 rounded-lg bg-primary/5">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                          <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-wide">Plato Principal</p>
                            <p className="font-semibold text-sm">{menu.main_dish.name}</p>
                          </div>
                        </div>
                      )}

                      {menu.drink && (
                        <div className="flex items-start gap-3 p-2 rounded-lg bg-accent/5">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                          <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-wide">Bebida</p>
                            <p className="font-semibold text-sm">{menu.drink.name}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-base py-6 font-semibold shadow-lg" 
                      disabled={menu.stock === 0}
                      onClick={() => handleReserve(menu.id, menu.date)}
                    >
                      {menu.stock === 0 ? (
                        <>
                          🔴 Agotado - No Disponible
                        </>
                      ) : (
                        <>
                          🍽️ Reservar Este Menú
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card className="border-2">
                <CardContent className="flex items-center justify-between py-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-2"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Página</span>
                    <span className="text-lg font-bold text-primary">{currentPage}</span>
                    <span className="text-sm text-muted-foreground">de {totalPages}</span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-2"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}