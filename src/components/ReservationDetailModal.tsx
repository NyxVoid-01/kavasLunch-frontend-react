import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, CreditCard, Package, Mail } from 'lucide-react';

// Helper para parsear fechas de forma segura
const safeParseDate = (dateStr: string): Date => {
  const cleanDate = dateStr.split('T')[0];
  return new Date(cleanDate + 'T00:00:00');
};

interface Reservation {
  id: string;
  code?: string;
  reservation_date: string;
  time_slot?: string;
  time_slot_display?: string;
  pickup_time_slot?: string;
  status: 'pending' | 'delivered' | 'cancelled';
  payment_method: string;
  payment_status?: 'pending' | 'paid';
  total_price: string | number;
  qr_code_url?: string;
  created_at: string;
  daily_menu?: {
    date?: string;
    price?: number;
    appetizer?: { name: string; description: string } | null;
    main_dish?: { name: string; description: string } | null;
    drink?: { name: string; description: string } | null;
  };
  menu?: {
    id: string;
    date: string;
    price: string | number;
    appetizer?: string | { name: string; description: string };
    main_dish?: string | { name: string; description: string };
    drink?: string | { name: string; description: string };
  };
}

interface ReservationDetailModalProps {
  reservation: Reservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ReservationDetailModal({ reservation, open, onOpenChange }: ReservationDetailModalProps) {
  if (!reservation) return null;

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'yape': return 'Yape/Plin';
      case 'card': return 'Tarjeta';
      case 'cash': return 'Efectivo';
      default: return method;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            <span>Detalles de Reserva</span>
            {getStatusBadge(reservation.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Confirmación de Correo */}
          {reservation.status === 'pending' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
              <Mail className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900">
                  Correo de confirmación enviado
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Revisa tu bandeja de entrada para más detalles
                </p>
              </div>
            </div>
          )}

          {/* Pickup Code */}
          <div className="bg-primary text-primary-foreground p-6 rounded-lg text-center">
            <p className="text-sm font-medium mb-2">Código de Recojo</p>
            <p className="text-4xl font-bold tracking-wider">
              {reservation.code || reservation.id.substring(0, 8).toUpperCase()}
            </p>
          </div>

          {/* Date and Time Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Fecha de Reserva</p>
                <p className="font-semibold">
                  {format(safeParseDate(reservation.reservation_date), "d 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Horario de Recojo</p>
                <p className="font-semibold">
                  {reservation.pickup_time_slot || reservation.time_slot_display || reservation.time_slot || 'No especificado'}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Details */}
          {reservation.menu && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Contenido del Menú
              </h3>
              <div className="space-y-2 pl-2">
                {reservation.menu.appetizer && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs font-bold text-primary uppercase">Entrada</p>
                    <p className="font-semibold">
                      {typeof reservation.menu.appetizer === 'string' 
                        ? reservation.menu.appetizer 
                        : reservation.menu.appetizer.name}
                    </p>
                    {typeof reservation.menu.appetizer === 'object' && reservation.menu.appetizer.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {reservation.menu.appetizer.description}
                      </p>
                    )}
                  </div>
                )}

                {reservation.menu.main_dish && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs font-bold text-primary uppercase">Plato Principal</p>
                    <p className="font-semibold">
                      {typeof reservation.menu.main_dish === 'string' 
                        ? reservation.menu.main_dish 
                        : reservation.menu.main_dish.name}
                    </p>
                    {typeof reservation.menu.main_dish === 'object' && reservation.menu.main_dish.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {reservation.menu.main_dish.description}
                      </p>
                    )}
                  </div>
                )}

                {reservation.menu.drink && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs font-bold text-primary uppercase">Bebida</p>
                    <p className="font-semibold">
                      {typeof reservation.menu.drink === 'string' 
                        ? reservation.menu.drink 
                        : reservation.menu.drink.name}
                    </p>
                    {typeof reservation.menu.drink === 'object' && reservation.menu.drink.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {reservation.menu.drink.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}          {/* Payment Info */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Método de Pago</p>
                <p className="font-semibold">{getPaymentMethodText(reservation.payment_method)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-3xl font-bold text-primary">
                S/ {(() => {
                  const price = reservation.total_price || reservation.menu?.price || reservation.daily_menu?.price;
                  if (!price) return '0.00';
                  return typeof price === 'number' ? price.toFixed(2) : parseFloat(price).toFixed(2);
                })()}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
