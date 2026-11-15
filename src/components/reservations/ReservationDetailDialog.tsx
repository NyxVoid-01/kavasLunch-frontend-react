import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, CreditCard, Download, Info, Mail, Package, X } from 'lucide-react';
import { toast } from 'sonner';
import type { UserReservation } from '@/types';
import { parseLocalDate } from '@/lib/dates';
import { PAYMENT_LABELS, PAYMENT_STATUS_LABELS, slotLabel } from '@/lib/labels';
import { downloadReceipt } from '@/lib/receipt';
import { canCancelReservation } from '@/lib/reservationRules';
import ReservationStatusBadge from '@/components/ReservationStatusBadge';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ReservationDetailDialogProps {
  reservation: UserReservation | null;
  holder: { name: string; email: string };
  onClose: () => void;
  onCancel: (reservation: UserReservation) => void;
}

const MenuPart = ({ label, name }: { label: string; name: string | null }) =>
  name ? (
    <div className="rounded-xl bg-muted px-3 py-2">
      <p className="text-[11px] leading-4 font-bold text-primary uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold">{name}</p>
    </div>
  ) : null;

// Detalle de una reserva (prototipo): código, fecha y turno, contenido del menú, pago y comprobante descargable
export default function ReservationDetailDialog({ reservation, holder, onClose, onCancel }: ReservationDetailDialogProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!reservation) return;
    setDownloading(true);
    try {
      await downloadReceipt(reservation, holder);
      toast.success('Comprobante descargado');
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('No se pudo generar el comprobante');
    } finally {
      setDownloading(false);
    }
  };

  const pending = reservation?.status === 'pending';
  const cancellable = reservation ? canCancelReservation(reservation) : false;

  return (
    <Dialog open={!!reservation} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 gap-0 overflow-hidden rounded-2xl flex flex-col">
        {reservation && (
          <>
            <DialogHeader className="px-5 pt-5 pb-3 pr-12 text-left">
              <DialogTitle className="flex items-center justify-between gap-3 text-xl">
                <span>Detalles de Reserva</span>
                <ReservationStatusBadge status={reservation.status} />
              </DialogTitle>
            </DialogHeader>

            <div className="px-5 pb-4 space-y-3 overflow-y-auto">
              {pending && (
                <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3">
                  <Mail className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Correo de confirmación enviado</p>
                    <p className="text-xs text-green-700">Revisa tu bandeja de entrada para más detalles</p>
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-primary px-4 py-3 text-center text-primary-foreground">
                <p className="text-sm font-medium">Código de Recojo</p>
                <p className="text-3xl font-bold tracking-wider">{reservation.code}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
                  <Calendar className="w-4 h-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha de Reserva</p>
                    <p className="text-sm font-semibold">
                      {format(parseLocalDate(reservation.reservation_date), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
                  <Clock className="w-4 h-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Horario de Recojo</p>
                    <p className="text-sm font-semibold">{slotLabel(reservation)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="flex items-center gap-2 font-bold">
                  <Package className="w-4 h-4" />
                  Contenido del Menú
                </h3>
                <MenuPart label="Entrada" name={reservation.menu.appetizer} />
                <MenuPart label="Plato Principal" name={reservation.menu.main_dish} />
                <MenuPart label="Bebida" name={reservation.menu.drink} />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3 py-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Método de Pago</p>
                    <p className="text-sm font-semibold">
                      {PAYMENT_LABELS[reservation.payment_method] ?? reservation.payment_method}
                      <span className="font-normal text-muted-foreground"> · {PAYMENT_STATUS_LABELS[reservation.payment_status]}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-primary leading-7">S/ {Number(reservation.menu.price).toFixed(2)}</p>
                </div>
              </div>

              {pending && !cancellable && (
                <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="w-3.5 h-3.5 mt-px shrink-0" />
                  Ya no se puede cancelar: solo es posible hasta las 10:00 del día de la reserva.
                </p>
              )}
            </div>

            <div className="flex gap-2 px-5 py-3 border-t bg-background">
              <Button className="h-11 flex-1 font-semibold" onClick={handleDownload} disabled={downloading}>
                <Download className="w-4 h-4 mr-2" />
                {downloading ? 'Generando...' : 'Descargar comprobante'}
              </Button>
              {pending && cancellable && (
                <Button
                  variant="outline"
                  className="h-11 border-destructive/40 font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onCancel(reservation)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
