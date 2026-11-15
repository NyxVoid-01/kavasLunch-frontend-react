import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { UserReservation } from '@/types';
import { parseLocalDate } from '@/lib/dates';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface CancelReservationDialogProps {
  reservation: UserReservation | null;
  cancelling: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// Confirmación antes de cancelar (RNF-007: confirmar las acciones destructivas)
export default function CancelReservationDialog({ reservation, cancelling, onConfirm, onClose }: CancelReservationDialogProps) {
  return (
    <AlertDialog open={!!reservation} onOpenChange={(open) => !open && !cancelling && onClose()}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar reserva</AlertDialogTitle>
          <AlertDialogDescription>
            {reservation && (
              <>
                ¿Estás seguro de que deseas cancelar la reserva <strong>{reservation.code}</strong> del{' '}
                {format(parseLocalDate(reservation.reservation_date), "d 'de' MMMM", { locale: es })}? La porción volverá al stock y
                no podrás deshacerlo.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelling}>Volver</AlertDialogCancel>
          <Button variant="destructive" onClick={onConfirm} disabled={cancelling}>
            {cancelling ? 'Cancelando...' : 'Sí, cancelar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
