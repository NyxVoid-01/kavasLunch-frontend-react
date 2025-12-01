import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserReservations, cancelReservation, getReservationById } from '@/services/reservations';
import type { Reservation } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReservationDetailModal from '@/components/ReservationDetailModal';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Package, Clock, CheckCircle, XCircle, Calendar, Eye, Search, ArrowLeft, ChevronLeft, ChevronRight, XCircle as XCircle2, Mail } from 'lucide-react';

// Helper para parsear fechas de forma segura
const safeParseDate = (dateStr: string): Date => {
  // Si viene con timestamp, extraer solo la fecha
  const cleanDate = dateStr.split('T')[0];
  return new Date(cleanDate + 'T00:00:00');
};

// Helper para normalizar datos del backend Laravel
const normalizeReservation = (reservation: any): Reservation => {
  return {
    ...reservation,
    // Normalizar time_slot: usar pickup_time_slot si existe
    time_slot: reservation.pickup_time_slot || reservation.time_slot,
    time_slot_display: reservation.pickup_time_slot || reservation.time_slot_display || reservation.time_slot,
    // Normalizar total_price: usar menu.price si total_price no existe
    total_price: reservation.total_price || reservation.menu?.price,
    // Normalizar daily_menu: usar menu si daily_menu no existe
    daily_menu: reservation.daily_menu || reservation.menu,
    // Normalizar code
    code: reservation.code,
  };
};

export default function Reservations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReservations, setTotalReservations] = useState(0);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchReservations();
  }, [user, filter, currentPage, searchTerm]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      
      const allReservations = await getUserReservations();
      
      // Normalizar datos del backend
      const normalized = allReservations.map(normalizeReservation);
      
      // Filtrar por estado si es necesario
      let filtered = normalized;
      if (filter !== 'all') {
        filtered = normalized.filter(r => r.status === filter);
      }

      // Filtrar por búsqueda si hay término
      if (searchTerm) {
        filtered = filtered.filter(r => {
          try {
            return r.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   r.reservation_date.includes(searchTerm) ||
                   r.daily_menu?.main_dish?.name?.toLowerCase().includes(searchTerm.toLowerCase());
          } catch (e) {
            return false;
          }
        });
      }

      setTotalReservations(filtered.length);
      
      // Aplicar paginación
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE;
      const paginated = filtered.slice(from, to);
      
      setReservations(paginated);
    } catch (error: any) {
      console.error('Error fetching reservations:', error);
      toast.error('Error al cargar tus reservas');
      setReservations([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (reservationId: string) => {
    try {
      const detailReservation = await getReservationById(reservationId);
      
      // Normalizar datos del detalle
      const normalized = normalizeReservation(detailReservation);
      
      setSelectedReservation(normalized);
      setDetailModalOpen(true);
    } catch (error: any) {
      console.error('Error fetching reservation detail:', error);
      toast.error('Error al cargar el detalle de la reserva');
    }
  };

  const handleCancelReservation = async (reservationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      await cancelReservation(reservationId);
      toast.success('Reserva cancelada exitosamente');
      
      // Refrescar lista de reservas
      fetchReservations();
    } catch (error: any) {
      console.error('Error cancelling reservation:', error);
      const errorMessage = error.response?.data?.message || 'Error al cancelar la reserva';
      toast.error(errorMessage);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">Pendiente</Badge>;
      case 'delivered':
        return <Badge className="bg-success text-success-foreground">Entregado</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'yape':
        return 'Yape/Plin';
      case 'card':
        return 'Tarjeta';
      case 'cash':
        return 'Efectivo';
      default:
        return method;
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    
    try {
      return (
        reservation.id.toLowerCase().includes(search) ||
        reservation.daily_menu?.main_dish?.name?.toLowerCase().includes(search) ||
        format(safeParseDate(reservation.reservation_date), "d 'de' MMMM", { locale: es }).toLowerCase().includes(search)
      );
    } catch (e) {
      // Si hay error parseando la fecha, solo buscar por ID
      return reservation.id.toLowerCase().includes(search);
    }
  });

  const totalPages = Math.ceil(totalReservations / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Cargando reservas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <ReservationDetailModal 
        reservation={selectedReservation} 
        open={detailModalOpen} 
        onOpenChange={setDetailModalOpen} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/menus/user')}
          className="mb-6 md:hidden"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-primary">Mis Reservas</h1>
          <p className="text-muted-foreground">Historial completo de tus pedidos y códigos de recojo</p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, plato o fecha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => { setFilter('all'); setCurrentPage(1); }}
              size="sm"
            >
              Todas
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => { setFilter('pending'); setCurrentPage(1); }}
              size="sm"
            >
              Pendientes
            </Button>
            <Button
              variant={filter === 'delivered' ? 'default' : 'outline'}
              onClick={() => { setFilter('delivered'); setCurrentPage(1); }}
              size="sm"
            >
              Entregadas
            </Button>
            <Button
              variant={filter === 'cancelled' ? 'default' : 'outline'}
              onClick={() => { setFilter('cancelled'); setCurrentPage(1); }}
              size="sm"
            >
              Canceladas
            </Button>
          </div>
        </div>

        {filteredReservations.length === 0 ? (
          <Card className="text-center py-16 border-2 border-dashed">
            <CardContent>
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl font-semibold mb-2">No tienes reservas</p>
              <p className="text-muted-foreground">¡Realiza tu primera reserva desde el menú!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredReservations.map((reservation) => (
                <Card 
                  key={reservation.id} 
                  className="overflow-hidden hover:shadow-xl transition-shadow border-2 border-primary/20"
                >
                  <div className="bg-primary/10 border-b-2 border-accent/30 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(reservation.status)}
                        <div>
                          <p className="font-semibold text-lg">
                            {format(safeParseDate(reservation.reservation_date), "d 'de' MMMM", { locale: es })}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {reservation.time_slot_display || reservation.time_slot || 'Pendiente'}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(reservation.status)}
                    </div>
                  </div>
                  
                  <CardContent className="p-6 space-y-4">
                    {/* Indicador de Correo Enviado */}
                    {reservation.status === 'pending' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-green-600 shrink-0" />
                        <p className="text-xs text-green-700 font-medium">
                          Correo de confirmación enviado
                        </p>
                      </div>
                    )}

                    {/* Pickup Code */}
                    <div className="bg-primary text-primary-foreground p-4 rounded-lg text-center">
                      <p className="text-xs font-medium mb-1">Código de Recojo</p>
                      <p className="text-3xl font-bold tracking-wider">
                        {reservation.code || reservation.id.substring(0, 8).toUpperCase()}
                      </p>
                    </div>

                    {/* Menu Summary */}
                    <div className="space-y-1 text-sm">
                      {reservation.daily_menu?.main_dish && (
                        <p className="font-semibold">🍽️ {reservation.daily_menu.main_dish.name}</p>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground">Método de Pago</p>
                      <p className="font-semibold">{getPaymentMethodText(reservation.payment_method)}</p>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="text-2xl font-bold text-primary">
                        S/ {(() => {
                          const price = reservation.total_price || reservation.menu?.price || reservation.daily_menu?.price;
                          if (!price) return '0.00';
                          return typeof price === 'number' ? price.toFixed(2) : parseFloat(price).toFixed(2);
                        })()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleViewDetail(reservation.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalle
                      </Button>
                      
                      {reservation.status === 'pending' && (
                        <Button 
                          variant="destructive"
                          size="sm"
                          onClick={(e) => handleCancelReservation(reservation.id, e)}
                          title="Cancelar reserva"
                        >
                          <XCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
