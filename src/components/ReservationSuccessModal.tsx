import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Check, Mail, Calendar, Clock, Receipt, X } from 'lucide-react';
import type { Reservation } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReservationSuccessModalProps {
  open: boolean;
  onClose: () => void;
  reservation: Reservation;
  userEmail: string;
}

export default function ReservationSuccessModal({ 
  open, 
  onClose, 
  reservation,
  userEmail 
}: ReservationSuccessModalProps) {
  
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-full">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              ¡Reserva Confirmada!
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Confirmación de Correo */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 p-2 rounded-lg shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-1">
                  Correo de Confirmación Enviado
                </h3>
                <p className="text-sm text-blue-700">
                  Hemos enviado un correo electrónico con todos los detalles de tu reserva a:
                </p>
                <p className="text-sm font-bold text-blue-900 mt-1">
                  📧 {userEmail}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  * Revisa tu bandeja de entrada y spam. El correo incluye todos los detalles.
                </p>
              </div>
            </div>
          </div>

          {/* Código de Recojo */}
          <div className="bg-white border-2 border-primary/20 rounded-lg p-6 text-center">
            <h3 className="font-bold text-lg mb-4 flex items-center justify-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Código de Recojo
            </h3>
            
            <div className="bg-primary/10 p-6 rounded-lg inline-block border-2 border-primary/30 min-w-[300px]">
              <p className="text-4xl font-bold text-primary tracking-wider">
                {reservation.code || reservation.id.substring(0, 8).toUpperCase()}
              </p>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Presenta este código al recoger tu pedido
            </p>
          </div>

          <Separator />

          {/* Detalles de la Reserva */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Detalles de tu Reserva
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha de Reserva
                </p>
                <p className="font-semibold">
                  {formatDate(reservation.reservation_date)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Horario de Recojo
                </p>
                <p className="font-semibold">
                  {reservation.pickup_time_slot || reservation.time_slot || 'Por asignar'}
                  {reservation.pickup_window_end && ` - ${reservation.pickup_window_end}`}
                </p>
              </div>
            </div>

            {/* Menú */}
            {reservation.menu && (
              <div className="bg-accent/5 rounded-lg p-4 space-y-3">
                <p className="font-bold text-sm text-primary uppercase">Tu Menú</p>
                
                {reservation.menu.appetizer && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥗</span>
                    <span className="text-sm">{reservation.menu.appetizer}</span>
                  </div>
                )}
                
                {reservation.menu.main_dish && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍽️</span>
                    <span className="text-sm font-semibold">{reservation.menu.main_dish}</span>
                  </div>
                )}
                
                {reservation.menu.drink && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🥤</span>
                    <span className="text-sm">{reservation.menu.drink}</span>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-bold">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    S/ {typeof reservation.menu.price === 'number' 
                      ? reservation.menu.price.toFixed(2) 
                      : reservation.menu.price}
                  </span>
                </div>
              </div>
            )}

            {/* Estado de Pago */}
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-sm font-semibold text-green-900">Estado de Pago:</span>
              <Badge variant={reservation.payment_status === 'paid' ? 'default' : 'secondary'}>
                {reservation.payment_status === 'paid' ? '✓ Pagado' : 'Pendiente'}
              </Badge>
            </div>

            {/* Método de Pago */}
            {reservation.payment_method && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-semibold text-blue-900">Método de Pago:</span>
                <span className="text-sm font-bold text-blue-900 capitalize">
                  {reservation.payment_method === 'cash' ? 'Efectivo' : 
                   reservation.payment_method === 'credit_card' ? 'Tarjeta' : 
                   reservation.payment_method}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Instrucciones */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <h4 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
              <span>⚠️</span>
              Importante
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Llega 5 minutos antes de tu horario de recojo</li>
              <li>Presenta tu código QR o código de reserva</li>
              <li>Revisa tu correo para más detalles</li>
              {reservation.payment_method === 'cash' && (
                <li className="font-semibold">Recuerda llevar el dinero exacto</li>
              )}
            </ul>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
          <Button 
            onClick={() => window.location.href = '/reservations'}
            className="flex-1"
          >
            Ver Mis Reservas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
