import { useEffect, useState } from 'react';
import { getAllReservations, deliverReservation, scanQRCode, cancelReservationAdmin } from '@/services/admin';
import type { Reservation } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight, Search, QrCode, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DeliverySystem() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    loadReservations();
  }, [filter]);

  useEffect(() => {
    filterReservations();
  }, [reservations, searchTerm, currentPage]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await getAllReservations();

      // Asegurar que data es un array
      const reservationsArray = Array.isArray(data) ? data : [];

      // Filter by status if needed
      let filtered = reservationsArray;
      if (filter !== 'all') {
        filtered = reservationsArray.filter(r => r.status === filter);
      }

      setReservations(filtered);
    } catch (error: any) {
      console.error('Error loading reservations:', error);
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = reservations;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(reservation => 
        reservation.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.pickup_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setFilteredReservations(filtered.slice(startIndex, endIndex));
  };

  const getTotalPages = () => {
    let filtered = reservations;
    if (searchTerm) {
      filtered = filtered.filter(reservation => 
        reservation.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.pickup_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return Math.ceil(filtered.length / ITEMS_PER_PAGE);
  };

  const handleUpdateStatus = async (reservation: Reservation, newStatus: 'delivered' | 'cancelled') => {
    try {
      if (newStatus === 'delivered') {
        await deliverReservation(reservation.id);
        toast.success('¡Pedido entregado!');
      } else {
        await cancelReservationAdmin(reservation.id);
        toast.success('Reserva cancelada correctamente');
      }

      loadReservations();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el estado');
    }
  };

  const handleScanQR = async () => {
    if (!qrCode.trim()) {
      toast.error('Por favor ingresa el código QR');
      return;
    }

    try {
      const result = await scanQRCode(qrCode);
      
      if (result.reservation) {
        toast.success(`Reserva de ${result.reservation.user?.name || 'usuario'} marcada como entregada`);
        setIsQRDialogOpen(false);
        setQrCode('');
        loadReservations();
      }
    } catch (error: any) {
      console.error('Error scanning QR:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Código QR inválido';
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50',
      delivered: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50',
      cancelled: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50',
    };
    const labels = {
      pending: 'Pendiente',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">Sistema de Despacho</h2>
          <p className="text-muted-foreground">Gestiona las entregas de pedidos</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <QrCode className="w-4 h-4 mr-2" />
                Escanear QR
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Escanear Código QR</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Ingresa el código QR..."
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleScanQR();
                      }
                    }}
                    autoFocus
                  />
                </div>
                <Button onClick={handleScanQR} className="w-full">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marcar como Entregado
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={loadReservations} variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o código..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => {
              setFilter('pending');
              setCurrentPage(1);
            }}
            size="sm"
          >
            Pendientes
          </Button>
          <Button
            variant={filter === 'delivered' ? 'default' : 'outline'}
            onClick={() => {
              setFilter('delivered');
              setCurrentPage(1);
            }}
            size="sm"
          >
            Entregados
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => {
              setFilter('all');
              setCurrentPage(1);
            }}
            size="sm"
          >
            Todos
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground mt-4">Cargando reservas...</p>
        </div>
      ) : filteredReservations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'No se encontraron reservas con los criterios de búsqueda' 
                : `No hay reservas ${filter !== 'all' ? filter === 'pending' ? 'pendientes' : 'entregadas' : ''}`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredReservations.map((reservation) => (
              <Card key={reservation.id} className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{reservation.user?.full_name || reservation.user?.email}</CardTitle>
                      <p className="text-sm text-muted-foreground">{reservation.user?.email}</p>
                    </div>
                    {getStatusBadge(reservation.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Pickup Code */}
                  <div className="bg-primary/10 p-3 rounded-lg text-center border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">Código de Recojo</p>
                    <p className="text-2xl font-bold text-primary tracking-wider">{reservation.pickup_code}</p>
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Fecha</p>
                      <p className="font-semibold">
                        {format(new Date(reservation.menu?.date || reservation.reservation_date), "d 'de' MMM", { locale: es })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pago</p>
                      <p className="font-semibold">
                        {reservation.payment_method === 'yape' ? 'Yape/Plin' :
                         reservation.payment_method === 'card' ? 'Tarjeta' : 'Efectivo'}
                      </p>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="space-y-1 p-3 bg-muted/50 rounded-lg text-sm">
                    {reservation.menu?.appetizer && (
                      <p>🥗 {reservation.menu.appetizer.name}</p>
                    )}
                    {reservation.menu?.main_dish && (
                      <p>🍽️ {reservation.menu.main_dish.name}</p>
                    )}
                    {reservation.menu?.drink && (
                      <p>🥤 {reservation.menu.drink.name}</p>
                    )}
                    <p className="font-bold text-primary pt-1">
                      Total: S/ {typeof reservation.menu?.price === 'string' 
                        ? parseFloat(reservation.menu.price).toFixed(2) 
                        : reservation.menu?.price?.toFixed(2) || '0.00'}
                    </p>
                  </div>

                  {/* Actions */}
                  {reservation.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleUpdateStatus(reservation, 'delivered')}
                        className="flex-1"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Entregar
                      </Button>
                      <Button
                        onClick={() => handleUpdateStatus(reservation, 'cancelled')}
                        variant="destructive"
                        className="flex-1"
                        size="sm"
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {getTotalPages() > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {getTotalPages()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(getTotalPages(), prev + 1))}
                disabled={currentPage >= getTotalPages()}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}