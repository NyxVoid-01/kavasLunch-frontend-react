import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, Calendar, Check, Clock, CupSoda, Leaf, Mail, Receipt, UtensilsCrossed, X } from 'lucide-react';
import type { Reservation } from '@/types';
import { parseLocalDate } from '@/lib/dates';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface ReservationSuccessModalProps {
  open: boolean;
  onClose: () => void;
  onViewReservations: () => void;
  reservation: Reservation;
  userEmail: string;
}

const PAYMENT_LABELS: Record<string, string> = {
  yape: 'Yape / Plin',
  plin: 'Yape / Plin',
  credit_card: 'Tarjeta',
  cash: 'Efectivo',
};

// Confirmación de la reserva: código de recojo, turno, menú, pago e indicaciones
export default function ReservationSuccessModal({
  open,
  onClose,
  onViewReservations,
  reservation,
  userEmail,
}: ReservationSuccessModalProps) {
  const slot = reservation.pickup_time_slot || reservation.time_slot;
  const isPaid = reservation.payment_status === 'paid';
  const menu = reservation.menu;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] p-0 gap-0 overflow-hidden rounded-2xl flex flex-col">
        <DialogHeader className="px-5 pt-5 pb-3 pr-12 text-left">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-primary">
            <span className="flex bg-green-100 p-1.5 rounded-full text-green-600">
              <Check className="w-5 h-5" />
            </span>
            ¡Reserva Confirmada!
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-4 space-y-4 overflow-y-auto">
          {/* Correo de confirmación */}
          <div className="flex items-start gap-3 rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-3">
            <span className="flex bg-blue-500 p-2 rounded-xl text-white shrink-0">
              <Mail className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h3 className="font-bold text-blue-900">Correo de Confirmación Enviado</h3>
              <p className="text-sm text-blue-700">Te enviamos los detalles de tu reserva a:</p>
              <p className="text-sm font-bold text-blue-900 break-all">{userEmail}</p>
              <p className="text-xs text-blue-600 mt-1">* Revisa tu bandeja de entrada y spam.</p>
            </div>
          </div>

          {/* Código de recojo */}
          <div className="rounded-2xl border-2 border-primary/20 p-4 text-center">
            <h3 className="flex items-center justify-center gap-2 font-bold mb-3">
              <Receipt className="w-5 h-5 text-primary" />
              Código de Recojo
            </h3>
            <div className="inline-block min-w-[min(260px,100%)] rounded-2xl border-2 border-primary/30 bg-primary/10 px-5 py-3">
              <p className="text-3xl font-bold tracking-wider text-primary">
                {reservation.code || reservation.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-3">Presenta este código al recoger tu pedido</p>
          </div>

          <Separator />

          {/* Detalles */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-bold">
              <Receipt className="w-5 h-5 text-primary" />
              Detalles de tu Reserva
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Fecha de Reserva
                </p>
                <p className="font-semibold first-letter:uppercase">
                  {format(parseLocalDate(reservation.reservation_date), "EEEE, d 'de' MMMM", { locale: es })}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Horario de Recojo
                </p>
                <p className="font-semibold">
                  {slot || 'Por asignar'}
                  {slot && reservation.pickup_window_end && ` - ${reservation.pickup_window_end}`}
                </p>
              </div>
            </div>

            {menu && (
              <div className="rounded-2xl bg-accent/5 p-3 space-y-2">
                <p className="text-sm font-bold text-primary uppercase">Tu Menú</p>
                {menu.appetizer && (
                  <p className="flex items-center gap-2 text-sm">
                    <Leaf className="w-4 h-4 text-primary" />
                    {menu.appetizer}
                  </p>
                )}
                {menu.main_dish && (
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <UtensilsCrossed className="w-4 h-4 text-primary" />
                    {menu.main_dish}
                  </p>
                )}
                {menu.drink && (
                  <p className="flex items-center gap-2 text-sm">
                    <CupSoda className="w-4 h-4 text-primary" />
                    {menu.drink}
                  </p>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-bold">Total:</span>
                  <span className="text-2xl font-bold text-primary">S/ {Number(menu.price).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 p-3">
              <span className="text-sm font-semibold text-green-900">Estado de Pago:</span>
              {isPaid ? (
                <Badge className="gap-1">
                  <Check className="w-3 h-3" />
                  Pagado
                </Badge>
              ) : (
                <Badge variant="secondary">Pendiente</Badge>
              )}
            </div>

            {reservation.payment_method && (
              <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 p-3">
                <span className="text-sm font-semibold text-blue-900">Método de Pago:</span>
                <span className="text-sm font-bold text-blue-900">
                  {PAYMENT_LABELS[reservation.payment_method] ?? reservation.payment_method}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Indicaciones */}
          <div className="rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-3">
            <h4 className="flex items-center gap-2 font-bold text-yellow-900 mb-1.5">
              <AlertTriangle className="w-4 h-4" />
              Importante
            </h4>
            <ul className="text-sm text-yellow-800 space-y-0.5 list-disc list-inside">
              <li>Llega 5 minutos antes de tu horario de recojo</li>
              <li>Presenta tu código de reserva</li>
              <li>Revisa tu correo para más detalles</li>
              {reservation.payment_method === 'cash' && <li className="font-semibold">Recuerda llevar el dinero exacto</li>}
            </ul>
          </div>
        </div>

        {/* Acciones siempre visibles */}
        <div className="flex gap-3 px-5 py-3 border-t bg-background">
          <Button variant="outline" onClick={onClose} className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
          <Button onClick={onViewReservations} className="flex-1">
            Ver Mis Reservas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
